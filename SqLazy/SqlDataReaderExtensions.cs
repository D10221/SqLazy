using System.Collections.Generic;
using System.Data;

namespace Node2SqlBridge
{
    public static class SqlDataReaderExtensions
    {
        /// <summary>
        ///  usage: using (var reader = cmd.ExecuteReader()) { reader.ToDictionaries() }
        /// </summary>
        public static IEnumerable<IDictionary<string, object>> ToDictionaries(this IDataReader reader)
        {
            var results = new List<IDictionary<string, object>>();

            while (reader.Read())
            {
                var result = new Dictionary<string, object>();

                for (var i = 0; i < reader.FieldCount; i++)
                {				    
                    result.Add(reader.GetName(i), reader.GetValue(i));
                }

                results.Add(result);
            }
            return results;
        }
    }
}