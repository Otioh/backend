interface WRITER {
    fullName:string;
    regNo:string;
    campus:string;
    department:string;
    email:string;
}

interface FILE {
  fileName: string;
  dateCreated: Date;
  dateLastEdited: Date;
}


export interface MiSBInterface {
  author: WRITER;
  editor: WRITER;
  file:FILE;
  content:any;
}