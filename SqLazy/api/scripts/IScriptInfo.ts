interface  IScriptInfo{
    path: string;
    state: string;
    cmdAction:string;
    cmdType: string; //ex: "StoreProcedure","Text"
    sql: string; // sql query as string
}