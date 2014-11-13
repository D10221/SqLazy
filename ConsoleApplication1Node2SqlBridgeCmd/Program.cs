using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Node2SqlBridge;

namespace Node2SqlBridgeCmd
{
    class Program
    {
        static  void Main(string[] args)
        {
            var bridge = new Bridge();

            const string cnx = "Data Source=VBOXMSSQL" +
                               ";Initial Catalog=StanEvo;" +
                               "Persist Security Info=True;" +
                               "User ID=sa;Application Name=SqLazy;";

            var query = new
            {
                sql = "select * from status",
                connectionString = cnx,
                sqlAction = "ExecuteReader"
                //,CommandType = "StoreProcedure"
            }.ToDictionary();


            Action <Task<object>> actionQuery = (async (task) =>
            {
                try
                {
                    var taskResult = await task;
                    if (task.IsCompleted)
                    {
                        var result = taskResult as IEnumerable<IDictionary<string, object>>;
                        if (result == null)
                        {
                            Console.WriteLine("Error , result empty");
                            return;
                        }

                        Console.WriteLine("result:");
                        foreach (var kvp in result.SelectMany(d => d).ToArray()){
                            Console.WriteLine("Key: {0}, Value: {1}", kvp.Key, kvp.Value);
                        }

                        return;
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }

                Console.WriteLine("Error {0}", task.Exception);
            });            

            //actionQuery(bridge.Invoke(query));
            actionQuery(bridge.Invoke(new
            {
                sql = "TestProc",
                parameters = new { @PolicyNo=4,@PolicySeqNo=1,@Broker="",@DisplayPolicyNo=""},
                connectionString =cnx,
                sqlAction = "ExecuteScalar",
                CommandType = "StoredProcedure"

            }.ToDictionary()));
            

            actionQuery(bridge.Invoke(new
            {
                sql = "TestProc",
                parameters = new { @PolicyNo=4,@PolicySeqNo=1,@Broker="",@DisplayPolicyNo=""},
                connectionString =cnx,
                sqlAction = "ExecuteNonQuery",
                CommandType = "StoredProcedure"

            }.ToDictionary()));
            
            actionQuery(bridge.Invoke(new
            {
                sql = "TestProc",
                parameters = new { @PolicyNo=4,@PolicySeqNo=1,@Broker="",@DisplayPolicyNo=""},
                connectionString =cnx,
                sqlAction = "ExecuteReader",
                CommandType = "StoredProcedure"

            }.ToDictionary()));
                      
            Console.WriteLine("Any Key To Exit");
            Console.ReadKey();
        }
      
    }


    public static class Extensions
    {
        public static IDictionary<string, object> ToDictionary(this object target)
        {
            if (target == null) return null;
            Dictionary<string, object> dictionary = target.GetType().GetProperties().ToDictionary(prop => prop.Name, prop => prop.GetValue(target));
            return new Dictionary<string, object>(dictionary,StringComparer.InvariantCultureIgnoreCase);
        }
    }
}


