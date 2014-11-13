interface IDataStore<T> extends Array<T>{
    (config:{});
    insert(t:T[],callback : ( err:Error,newDocs:T[])=>void ) : void;
    find(query:{},callback:(error:Error,data:T[])=>void):void;
    findOne( aQuery:{}, callback:(err:Error, doc:T)=> void )
}

