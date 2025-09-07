/**
 * @class Agent
 * Quản lý các agent AI và tương tác với các nhà cung cấp mô hình ngôn ngữ khác nhau.
 *
 * @example
 * const asmAgent = new Agent();
 * const agent = asmAgent.createAgent('myAgent', 'OpenAI', {
 *   model: 'gpt-3.5-turbo',
 *   temperature: 0.7
 * });
 */
function Agent() {
  /** @private */
  this.agents = {};
  /** @private */
  this.providers = {
    OpenAI: new OpenAIProvider(),
    GoogleAI: new GoogleAIProvider(),
    DeepSeek: new DeepSeekProvider(),
    OpenRouter: new OpenRouterProvider(),
    Groq: new GroqProvider(),
    OpenAILike: new OpenAILikeProvider(),
  };
}

/**
 * Tạo một agent AI mới.
 * @param {string} agentName - Tên định danh cho agent.
 * @param {'OpenAI'|'GoogleAI'|'DeepSeek'|'OpenRouter'|'Groq'|'OpenAILike'} providerName - Nhà cung cấp AI.
 * @param {Object} config - Cấu hình cho agent.
 * @returns {Object} Một instance của agent với các phương thức.
 */
Agent.prototype.createAgent = function (agentName, providerName, config) {
  if (!agentName || typeof agentName !== "string") {
    throw new Error("Tên agent phải là một chuỗi không rỗng.");
  }
  if (this.agents[agentName]) {
    throw new Error(`Agent '${agentName}' đã tồn tại.`);
  }
  if (!this.providers[providerName]) {
    throw new Error(`Nhà cung cấp '${providerName}' chưa được đăng ký.`);
  }

  const agent = {
    /** @private */
    messageHistory: [],
    /** @private */
    systemPrompt: config.systemPrompt || "",

    /**
     * Thiết lập system prompt cho agent.
     * @param {string} prompt - System prompt.
     */
    setSystemPrompt: (prompt) => {
      if (typeof prompt !== "string") {
        throw new Error("System prompt phải là một chuỗi.");
      }
      agent.systemPrompt = prompt;
    },

    /**
     * Xóa lịch sử trò chuyện của agent.
     */
    clearHistory: () => {
      agent.messageHistory = [];
    },

    /**
     * Lấy lịch sử trò chuyện hiện tại.
     * @returns {Array<{role: string, content: string}>}
     */
    getHistory: () => {
      return [...agent.messageHistory];
    },

    /**
     * Gửi một truy vấn đến agent AI.
     * @param {string} input - Truy vấn đầu vào.
     * @param {boolean} [keepHistory=true] - Có lưu tương tác này vào lịch sử không.
     * @returns {Object} Object phản hồi.
     */
    query: (input, keepHistory = true) => {
      if (!input || typeof input !== "string") {
        return { status: 400, error: "Đầu vào phải là một chuỗi không rỗng." };
      }
      try {
        const messages = [];
        if (agent.systemPrompt) {
          messages.push({ role: "system", content: agent.systemPrompt });
        }
        messages.push(...agent.messageHistory);
        messages.push({ role: "user", content: input });

        const chatConfig = { ...config, messages };
        const response = this.providers[providerName].generateResponse(
          input,
          chatConfig
        );

        if (response.status === 200 && keepHistory) {
          agent.messageHistory.push(
            { role: "user", content: input },
            { role: "assistant", content: response.response }
          );
        }
        return response;
      } catch (error) {
        return {
          status: 500,
          error: `Lỗi khi thực hiện truy vấn: ${error.message}`,
        };
      }
    },
  };

  this.agents[agentName] = agent;
  return agent;
};

/**
 * Thiết lập API key cho các agent.
 * @param {string} key - Tên key (ví dụ: 'OPENAI_API_KEY').
 * @param {string} APIKEY - Giá trị API key.
 */
Agent.prototype.setupApiKey = function (key, APIKEY) {
  PropertiesService.getScriptProperties().setProperty(key, APIKEY);
};

/**
 * Liệt kê tất cả các agent đã đăng ký.
 * @returns {Array<string>} Mảng tên các agent.
 */
Agent.prototype.listAgents = function () {
  return Object.keys(this.agents);
};

/**
 * Liệt kê tất cả các nhà cung cấp đã đăng ký.
 * @returns {Array<string>} Mảng tên các nhà cung cấp.
 */
Agent.prototype.listProviders = function () {
  return Object.keys(this.providers);
};

// --- Provider Implementations ---

/** @class OpenAIProvider */
function OpenAIProvider() {}
OpenAIProvider.prototype.generateResponse = function (input, config) {
  const apiKey =
    config.apiKey ||
    PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");
  if (!apiKey) {
    return { status: 400, error: "OpenAI API key is required." };
  }

  const url = "https://api.openai.com/v1/chat/completions";
  const payload = {
    model: config.model || "gpt-3.5-turbo",
    messages: [{ role: "user", content: input }],
    temperature: config.temperature || 0.7,
    max_tokens: config.max_tokens || 100,
  };

  const options = {
    method: "post",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    if (result.error) {
      return {
        status: 500,
        error: `OpenAI API error: ${result.error.message}`,
      };
    }
    return {
      status: 200,
      response:
        result.choices[0]?.message?.content || "No response from OpenAI.",
    };
  } catch (error) {
    return { status: 500, error: `OpenAIProvider error: ${error.message}` };
  }
};

/** @class OpenAILikeProvider */
function OpenAILikeProvider() {}
OpenAILikeProvider.prototype.generateResponse = function (input, config) {
  const apiKey =
    config.apiKey ||
    PropertiesService.getScriptProperties().getProperty("OPENAI_LIKE_API_KEY");
  if (!apiKey) {
    return { status: 400, error: "API key is required." };
  }

  if (!config.baseURL) {
    return {
      status: 400,
      error: "Base URL is required for OpenAILike provider.",
    };
  }

  const url = `${config.baseURL}/chat/completions`;
  const payload = {
    model: config.model || "gpt-3.5-turbo",
    messages: config.messages || [{ role: "user", content: input }],
    temperature: config.temperature || 0.7,
    max_tokens: config.max_tokens || 100,
  };

  const options = {
    method: "post",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    if (result.error) {
      return { status: 500, error: `API error: ${result.error.message}` };
    }
    return {
      status: 200,
      response: result.choices[0]?.message?.content || "No response from API.",
    };
  } catch (error) {
    return {
      status: 500,
      error: `OpenAILikeProvider error: ${error.message}`,
    };
  }
};

/** @class GoogleAIProvider */
function GoogleAIProvider() {}
GoogleAIProvider.prototype.generateResponse = function (input, config) {
  const apiKey =
    config.apiKey ||
    PropertiesService.getScriptProperties().getProperty("GOOGLEAI_API_KEY");
  if (!apiKey) {
    return { status: 400, error: "Google AI API key is required." };
  }

  const model = config.model || "gemma-3-27b-it";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const payload = {
    contents: [
      {
        parts: [
          {
            text: input,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: config.temperature || 0.7,
      maxOutputTokens: config.max_tokens || 100,
    },
  };

  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    if (result.error) {
      return {
        status: 500,
        error: `Google AI API error: ${result.error.message}`,
      };
    }
    return {
      status: 200,
      response:
        result.candidates[0]?.content?.parts[0]?.text ||
        "No response from Google AI.",
    };
  } catch (error) {
    return { status: 500, error: `GoogleAIProvider error: ${error.message}` };
  }
};

/** @class DeepSeekProvider */
function DeepSeekProvider() {}
DeepSeekProvider.prototype.generateResponse = function (input, config) {
  const apiKey =
    config.apiKey ||
    PropertiesService.getScriptProperties().getProperty("DEEPSEEK_API_KEY");
  if (!apiKey) {
    return { status: 400, error: "DeepSeek API key is required." };
  }

  const url = "https://api.deepseek.com/v1/chat/completions";
  const payload = {
    model: config.model || "deepseek-chat",
    messages: [{ role: "user", content: input }],
    temperature: config.temperature || 0.7,
    max_tokens: config.max_tokens || 100,
  };

  const options = {
    method: "post",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    if (result.error) {
      return {
        status: 500,
        error: `DeepSeek API error: ${result.error.message}`,
      };
    }
    return {
      status: 200,
      response:
        result.choices[0]?.message?.content || "No response from DeepSeek.",
    };
  } catch (error) {
    return { status: 500, error: `DeepSeekProvider error: ${error.message}` };
  }
};

/** @class OpenRouterProvider */
function OpenRouterProvider() {}
OpenRouterProvider.prototype.generateResponse = function (input, config) {
  const apiKey =
    config.apiKey ||
    PropertiesService.getScriptProperties().getProperty("OPENROUTER_API_KEY");
  if (!apiKey) {
    return { status: 400, error: "OpenRouter API key is required." };
  }

  const url = "https://openrouter.ai/api/v1/chat/completions";
  const payload = {
    model: config.model || "openai/gpt-3.5-turbo",
    messages: [{ role: "user", content: input }],
    temperature: config.temperature || 0.7,
    max_tokens: config.max_tokens || 100,
  };

  const options = {
    method: "post",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": config.referer || "https://script.google.com",
      "X-Title": config.title || "GAS Agent",
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    if (result.error) {
      return {
        status: 500,
        error: `OpenRouter API error: ${result.error.message}`,
      };
    }
    return {
      status: 200,
      response:
        result.choices[0]?.message?.content || "No response from OpenRouter.",
    };
  } catch (error) {
    return {
      status: 500,
      error: `OpenRouterProvider error: ${error.message}`,
    };
  }
};

/** @class GroqProvider */
function GroqProvider() {}
GroqProvider.prototype.generateResponse = function (input, config) {
  const apiKey =
    config.apiKey ||
    PropertiesService.getScriptProperties().getProperty("GROQ_API_KEY");
  if (!apiKey) {
    return { status: 400, error: "Groq API key is required." };
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";
  const payload = {
    model: config.model || "mixtral-8x7b-32768",
    messages: [{ role: "user", content: input }],
    temperature: config.temperature || 0.7,
    max_tokens: config.max_tokens || 100,
  };

  const options = {
    method: "post",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    payload: JSON.stringify(payload),
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    if (result.error) {
      return {
        status: 500,
        error: `Groq API error: ${result.error.message}`,
      };
    }
    return {
      status: 200,
      response: result.choices[0]?.message?.content || "No response from Groq.",
    };
  } catch (error) {
    return { status: 500, error: `GroqProvider error: ${error.message}` };
  }
};
