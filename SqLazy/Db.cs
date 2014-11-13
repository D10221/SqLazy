using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Node2SqlBridge
{
    public class Bridge
	{
        
        public async Task<object> Echo(object input)
        {
            var echo = (string)((IDictionary<string, object>)input)["what"];
            await Task.Factory.StartNew(() => echo = "!"+echo);
            return echo;
        }
        

        public async Task<object> Invoke(object input)
		{
			// Edge marshalls data to .NET using an IDictionary<string, object>
			var payload = (IDictionary<string, object>) input;
            return await ExecSql(payload);
		}

        private string GetKey(string key,IDictionary<string, object> payload)
        {
            object value;
            if (payload.TryGetValue(key, out value))
                return value as String;
            return null;
        }
        private object GetObject(string key,IDictionary<string, object> payload)
        {
            object value;
            return payload.TryGetValue(key, out value) ? value : null;
        }

        private static IDictionary<string, object> ToDictionary(object parameters)
        {
            if (parameters == null)
            {
                return null;
            }
            return parameters.GetType().GetProperties().ToDictionary(prop => prop.Name, prop => prop.GetValue(parameters));

            // return parameters.Split(',').ToDictionary(s => s.Split('=').First(), s => s.Split('=').Last());
        }

        private async Task<object> ExecSql(IDictionary<string, object> payload)
        {            
            var sql = (string)payload["sql"];

            var connectionString = GetKey("connectionString", payload);

            var parameters = ToDictionary(GetObject("parameters", payload));

            CommandType commandType;
            var commandTypeAsString = GetKey("CommandType", payload);
            if (!Enum.TryParse(commandTypeAsString, true, out commandType))
                commandType = CommandType.Text;

            var cmdAction = GetKey("cmdAction", payload);

            object result = null;
            
            Exception error = null;

            using (var cnx = new SqlConnection(connectionString))
            {
                using (var cmd = new SqlCommand(sql, cnx))
                {
                    cmd.CommandType = commandType;
                    if (parameters != null)
                        foreach (var parameter in parameters)
                            cmd.Parameters.AddWithValue(parameter.Key, parameter.Value );

                    await cnx.OpenAsync();
                    
                    try
                    {
                        switch (cmdAction)
                        {
                            case "ExecuteReader":
                                using (var reader = await cmd.ExecuteReaderAsync(CommandBehavior.CloseConnection))
                                {
                                    result = reader.ToDictionaries().ToArray();
                                }
                                break;
                            case "ExecuteNonQuery":
                                result = await cmd.ExecuteNonQueryAsync();
                                break;
                            case "ExecuteScalar":
                                result = await cmd.ExecuteScalarAsync();
                                break;                                                        
                            case "ExecuteXml":
                                error =  new NotImplementedException();
                                break;
                            default:
                                error = new Exception("Not Understood :" + cmdAction, new NullReferenceException("cmdAction"));
                                break;
                        }
                    }                    
                    catch (SqlException sqle)
                    {
                        var pars =
                            cmd.Parameters.Cast<SqlParameter>()
                                .Select(p => p.ParameterName + ":" + p.Value)
                                .Aggregate((a, b) => a + ";" + b);
                        error = new Exception("Error: Sql Cmd: " + cmd.CommandText + " parameters: " + (pars ?? ""), sqle);                        
                    }
                    catch (Exception e)
                    {
                        error = e;
                    }

                    cnx.Close();
                }
            }

            if (error != null) throw error;
            return result;
        }
       
	}    

    static class DataReaderExtension
	{

		public static T Get<T>(this IDataReader reader, string columnName)
		{
			return reader.Get(columnName, default(T));
		}

		public static T Get<T>(this IDataReader reader, string columnName, T defaultValue)
		{
			if (reader == null)
				throw new ArgumentNullException("reader");
			if (string.IsNullOrEmpty(columnName))
				throw new ArgumentNullException("columnName");
			T value = defaultValue;
			var ordinal = reader.GetOrdinal(columnName);
			if (reader.IsDBNull(ordinal) == false)
				value = (T)reader.GetValue(ordinal);
			return value;
		}
	}
}