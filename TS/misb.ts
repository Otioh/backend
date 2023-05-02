import { MiSBInterface } from "./misb.interface";

const misbFormat: MiSBInterface = {
  author: {
    fullName: "No Name",
    campus: "No Campus",
    regNo: "No Reg No",

    department: "No Department",
    email: "No Email",
  },
  editor: {
    fullName: "No Name",
    campus: "No Campus",
    regNo: "No Reg No",

    department: "No Department",
    email: "No Email",
  },
  file:{
  fileName: "no filename",
  dateCreated: new Date(),
  dateLastEdited: new Date(),
},
content:{"empty":"document"}
};

export default misbFormat;