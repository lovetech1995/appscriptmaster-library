const SHEET_ID = "XXXXXX";
const SHEET_NAME = "Sheet1";

const makeExample = () => {
  const c0 = sheetASM.where("age", "==", 10);
  const c1 = sheetASM.where("name", "==", "Nghĩa");
  const qRef = sheetASM.query([c0, c1]);
  const datas = new sheetASM(SHEET_ID, SHEET_NAME).getDocs(qRef);
  Logger.log({ datas });
};
