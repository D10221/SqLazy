using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Node2SqlBridge
{
	public class Db
	{
				
		public async Task<object> Invoke(object input)
		{
			// Edge marshalls data to .NET using an IDictionary<string, object>
			var payload = (IDictionary<string, object>) input;
//			var pageNumber = (int) payload["pageNumber"];
//			var pageSize = (int) payload["pageSize"];
			var sql = (string) payload["sql"];
			return await Query(sql);
		}
		
		public async Task<IEnumerable<IDictionary<string,object>>> Query(string sql)
		{
			// Use the same connection string env variable
			var connectionString = Environment.GetEnvironmentVariable("EDGE_SQL_CONNECTION_STRING");
			if (connectionString == null)
				throw new ArgumentException("You must set the EDGE_SQL_CONNECTION_STRING environment variable.");
			
			
			IEnumerable<IDictionary<string, object>> miniTable;
			
			using (var cnx = new SqlConnection(connectionString))
			{
				using (var cmd = new SqlCommand(sql, cnx))
				{
					await cnx.OpenAsync();
					
					using (var reader = await cmd.ExecuteReaderAsync(CommandBehavior.CloseConnection))
					{
						miniTable = reader.ToDictionaries().ToArray();
					}

                    cnx.Close();
				}
			}
			return miniTable;
		}
	}
	
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