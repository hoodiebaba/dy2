from base import *

from sqlalchemy.pool import NullPool
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv
import uuid

env_file_name = ".env"
env_path = os.path.join(os.getcwd(), env_file_name)
load_dotenv(dotenv_path=env_path)

os.environ.setdefault("DEFAULT_PAGINATION_START", "0")
os.environ.setdefault("DEFAULT_PAGINATION_END", "50")
os.environ.setdefault("RUN_QUERY_THRESHOLD", "1000")
os.environ.setdefault("SECRET_KEY", "dy2-local-dev-secret")

LOCAL_DEV_MODE = os.environ.get("LOCAL_DEV_MOCK", "").lower() == "true"
if not all(
    [
        os.environ.get("SQL_DB_TYPE"),
        os.environ.get("SQL_HOST"),
        os.environ.get("SQL_PORT"),
        os.environ.get("SQL_USERNAME"),
        os.environ.get("SQL_PASSWORD"),
    ]
):
    LOCAL_DEV_MODE = True

sql_db_type=os.environ.get("SQL_DB_TYPE")


def global_error_handler(exception):
    print("An error occurred:", exception)


defaultPort={
    "MSSQL":1433,
    "MySQL":3306,
    "PostgreSQL":5432
}
sql_conn_obj={
    "dbName": os.environ.get("SQL_DATABASE"),
    "dbServer" : os.environ.get("SQL_HOST"),
    # "port": defaultPort[sql_db_type],
    "port": os.environ.get("SQL_PORT"),
    "dbtype": os.environ.get("SQL_DB_TYPE"),
    "password" : os.environ.get("SQL_PASSWORD"),
    "username" : os.environ.get("SQL_USERNAME"),
}

# sql_url=os.environ.get("SQL_URL")
# sql_host=os.environ.get("SQL_HOST")
# sql_port=os.environ.get("SQL_PORT")
# sql_database=os.environ.get("SQL_DATABASE")
# sql_connect=os.environ.get("SQL_CONNECT")
sql_driver=os.environ.get("SQL_DRIVER")
# sql_username=os.environ.get("SQL_USERNAME")
# sql_password=os.environ.get("SQL_PASSWORD")






def convert_to_int_or_str(value):
    try:
        # Try to convert the value to an integer
        result = int(value)
        return result
    except ValueError:
        # If it's not a number, treat it as a string


        # value=value.replace('"cnvrt',"")
        # value=value.replace('cnvrt"',"")
        return f"""'{value}'"""
    

def createConnStr(sql_db,sql_conn):
    
    connection_string=""
    if LOCAL_DEV_MODE:
        local_db_path = os.path.join(os.getcwd(), "local_dev.db")
        connection_string = f"sqlite:///{local_db_path}"
    elif(sql_db=="MSSQL"):
        print("MSSQL")
        connection_string=f"mssql+pyodbc://{sql_conn['username']}:{quote(sql_conn['password'])}@{sql_conn['dbServer']}:{sql_conn['port']}{'/'+sql_conn['dbName'] if sql_conn['dbName']!='' else ''}?driver={sql_driver}&MARS_Connection=yes&TrustServerCertificate=yes"

    elif(sql_db=="MySQL"):
        print("MySQL")
        connection_string=f"mysql+mysqlconnector://{sql_conn['username']}:{quote(sql_conn['password'])}@{sql_conn['dbServer']}:{sql_conn['port']}/{sql_conn['dbName']}"
    elif(sql_db=="PostgreSQL"):
        print("PostgreSQL")
        connection_string=f"postgresql+psycopg2://{sql_conn['username']}:{quote(sql_conn['password'])}@{sql_conn['dbServer']}:{sql_conn['port']}/{sql_conn['dbName']}"
    
    print(connection_string,"connection_string")
    return connection_string


def _local_dev_now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def _strip_convert_wrapper(value):
    if not isinstance(value, str) or "cnvrtCONVERT(DATETIME," not in value:
        return value

    stripped = value.replace("cnvrtCONVERT(DATETIME, ", "").replace(")cnvrt", "").strip()
    parts = stripped.split(",")
    return parts[0].strip()[1:-1]


def _ensure_local_dev_schema():
    admin_role_id = "role-admin"
    admin_user_id = "user-admin"
    default_db_id = "db-local"

    with engine_creation.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS userRole (
                sid INTEGER PRIMARY KEY AUTOINCREMENT,
                id TEXT UNIQUE,
                rolename TEXT,
                permission TEXT,
                create_time TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS Users (
                sid INTEGER PRIMARY KEY AUTOINCREMENT,
                id TEXT UNIQUE,
                firstname TEXT,
                lastname TEXT,
                username TEXT UNIQUE,
                password TEXT,
                roleId TEXT,
                loginType TEXT,
                deleteStatus INTEGER DEFAULT 0,
                create_time TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS userConfig (
                sid INTEGER PRIMARY KEY AUTOINCREMENT,
                id TEXT UNIQUE,
                configName TEXT,
                configValue TEXT,
                createdBy TEXT,
                create_time TEXT DEFAULT CURRENT_TIMESTAMP,
                update_time TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS dbConfig (
                sid INTEGER PRIMARY KEY AUTOINCREMENT,
                id TEXT UNIQUE,
                dbName TEXT,
                dbServer TEXT,
                dbtype TEXT,
                username TEXT,
                password TEXT,
                port TEXT,
                createdBy TEXT,
                deleteStatus INTEGER DEFAULT 0,
                create_time TEXT DEFAULT CURRENT_TIMESTAMP,
                update_time TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS alertConfig (
                sid INTEGER PRIMARY KEY AUTOINCREMENT,
                id TEXT UNIQUE,
                frequency TEXT,
                dbServer TEXT,
                mailQuery TEXT,
                graphQuery TEXT,
                mailSubject TEXT,
                mailRecipients TEXT,
                mailBody TEXT,
                startAt TEXT,
                endAt TEXT,
                timeall TEXT,
                userId TEXT,
                mailOutput TEXT,
                createdBy TEXT,
                deleteStatus INTEGER DEFAULT 0,
                create_time TEXT DEFAULT CURRENT_TIMESTAMP,
                update_time TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS alertConfigInstant (
                sid INTEGER PRIMARY KEY AUTOINCREMENT,
                id TEXT UNIQUE,
                frequency TEXT,
                dbServer TEXT,
                mailQuery TEXT,
                graphQuery TEXT,
                mailSubject TEXT,
                mailRecipients TEXT,
                mailBody TEXT,
                mailQueryBody TEXT,
                startAt TEXT,
                endAt TEXT,
                nextSendAt TEXT,
                lastSendAt TEXT,
                blockage INTEGER DEFAULT 0,
                blockMsg TEXT,
                userId TEXT,
                mailOutput TEXT,
                createdBy TEXT,
                deleteStatus INTEGER DEFAULT 0,
                create_time TEXT DEFAULT CURRENT_TIMESTAMP,
                update_time TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS savedQueries (
                sid INTEGER PRIMARY KEY AUTOINCREMENT,
                id TEXT UNIQUE,
                queries TEXT,
                dbServer TEXT,
                userId TEXT,
                create_time TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """))

        conn.execute(
            text("""
                INSERT OR IGNORE INTO userRole (id, rolename, permission)
                VALUES (:id, :rolename, :permission)
            """),
            {"id": admin_role_id, "rolename": "ADMIN", "permission": "{}"},
        )
        conn.execute(
            text("""
                INSERT OR IGNORE INTO Users (id, firstname, lastname, username, password, roleId, loginType, deleteStatus)
                VALUES (:id, :firstname, :lastname, :username, :password, :roleId, :loginType, :deleteStatus)
            """),
            {
                "id": admin_user_id,
                "firstname": "Datayog",
                "lastname": "Admin",
                "username": "datayog",
                "password": "datayog",
                "roleId": admin_role_id,
                "loginType": "web",
                "deleteStatus": 0,
            },
        )
        conn.execute(
            text("""
                INSERT OR IGNORE INTO dbConfig
                (id, dbName, dbServer, dbtype, username, password, port, createdBy, deleteStatus)
                VALUES
                (:id, :dbName, :dbServer, :dbtype, :username, :password, :port, :createdBy, :deleteStatus)
            """),
            {
                "id": default_db_id,
                "dbName": "Local Dev DB",
                "dbServer": "127.0.0.1",
                "dbtype": "SQLite",
                "username": "local",
                "password": "local",
                "port": "0",
                "createdBy": admin_user_id,
                "deleteStatus": 0,
            },
        )

connection_str=createConnStr(sql_db_type,sql_conn_obj)

print("sql_db",connection_str,"connection_str")


try:
    engine_creation = create_engine(connection_str)
    if LOCAL_DEV_MODE:
        _ensure_local_dev_schema()
    # engine_conn=engine_creation.connect()
    engine_conn=engine_creation.connect().execution_options(
        **{"compiled_cache": None, "global_error_handler": global_error_handler}
    )

except exc.PendingRollbackError as e:
    print(e,"PendingRollbackError")



def findingTableView(command):

    # engine_conn=engine_creation.connect()
    print(text(command))
    data=engine_conn.execute(text(command))
    column_names = data.keys()
    # engine_conn.close()
    return data

def directdftosql(data,tablename,updateBy):
    data.to_sql(tablename,con=engine_conn,index=False, dtype={'create_date': DateTime})

    
def dftosql(data,tablename,updateBy):
    
    try:
        print(data,updateBy,"datadatadata")
        json_data=cfc.dfjson(data)

        print(json_data,"json_datajson_datajson_data")
        print(updateBy,"updateBy")

        for i in json_data:
            selection=[]
            upser=copy.copy(i)
            elser={}
            for j in updateBy:
                selection.append(j+"=:"+j+"")
                elser[j]=i[j]
                del upser[j]

            print(selection,upser,elser)

            


            resultkeys = ', '.join([f"{item}" if isinstance(item, str) else str(item) for item in list(i.keys())])
            resultvalues = ', '.join([f':{item}' if isinstance(item, str) else ":"+str(item) for item in list(i.keys())])
            upserresultkeys = ' , '.join([f'{item}=:{item}' if isinstance(val, str) else item+"=:"+str(item) for item,val in upser.items()])
            
            final_pro=f"""if exists(SELECT * from {tablename} where {" AND ".join(selection)})            
BEGIN            
    update {tablename} set {upserresultkeys} where {" AND ".join(selection)}
End                    
else            
begin  
    insert into {tablename}({resultkeys}) values({resultvalues})  
end"""

            
            print(final_pro)

            # print(final_pro,selection,upser)


        # data.to_sql(tablename,con=engine_conn,if_exists=if_exists,index=False, dtype={'create_date': DateTime})

            # print(text(final_pro),i)
                
            # engine_conn=engine_creation.connect() changeHere
            engine_conn=engine_creation.connect().execution_options(
                **{"compiled_cache": None, "global_error_handler": global_error_handler}
            )
            data=engine_conn.execute(text(final_pro),i)
            
            engine_conn.commit()
            engine_conn.close()
        data={
            "status":200,
            "msg":"Data Saved Successfully",
            "data":[]
        }
        return data

    except Exception as e:

        error_message = str(e.args[1]) if len(e.args) > 1 else str(e)

        print(error_message,"error_messageerror_message")
        return {
            "status":400,
            "icon":"error",
            "msg":error_message
        }
        print(e)



def checkConnection(serverDetails):
    try:
        
        print(serverDetails,"serverDetailsserverDetailsserverDetails")

        # serverDetails["port"]=defaultPort[serverDetails["dbtype"]]
        dy_conn_str=createConnStr(serverDetails["dbtype"],serverDetails)

        print(dy_conn_str,"dy_conn_str")
        
        lclengine_creation = create_engine(dy_conn_str,poolclass=NullPool)

        # lclengine_conn=lclengine_creation.connect()
        lclengine_conn=lclengine_creation.connect().execution_options(
            **{"compiled_cache": None, "global_error_handler": global_error_handler}
        )

        return {
            "status":201,
            "icon":"success",
            "msg":"Connected Successfully"
        }

    except Exception as e:

        error_message = str(e.args[1]) if len(e.args) > 1 else str(e)
        return {
            "status":400,
            "icon":"error",
            "msg":error_message
        }
        print(e)

def findFromDifferentServer(serverDetails,command):
    try:

        # print(serverDetails,command,"serverDetails,command")
        # serverDetails["port"]=defaultPort[serverDetails["dbtype"]]
        dy_conn_str=createConnStr(serverDetails["dbtype"],serverDetails)

        print(dy_conn_str,"dy_conn_str")
        
        lclengine_creation = create_engine(dy_conn_str,poolclass=NullPool)

        # lclengine_conn=lclengine_creation.connect() change here
        lclengine_conn=lclengine_creation.connect().execution_options(
                **{"compiled_cache": None, "global_error_handler": global_error_handler}
            )
        data=lclengine_conn.execute(text(command))
        column_names = data.keys()
        result=data.fetchall()
        # rows = [dict(zip(column_names, row)) for row in data.fetchall()]

        df = pd.DataFrame(result, columns=column_names)
        # print(df.to_dict(orient="dict"))
        print(column_names,"column_namescolumn_namescolumn_names")
        # print(df["create_time"])
        
        # if("create_time" in column_names):
        #     df["create_time"]=df["create_time"].astype(str)
        
        date_columns = [col for col in df.columns if pd.api.types.is_datetime64_any_dtype(df[col])]

        # Convert datetime columns to string
        for col in date_columns:
            df[col] = df[col].dt.strftime("%Y/%m/%d %H:%M:%S")
        for i in column_names:
            print(df[i])
        
        # dasdasdasdas
        
        if(len(df)==0):
            df=[]

        data={
            "status":200,
            "msg":"Data Get Successfully",
            "data":df,
            "columns":list(column_names)
        }
        lclengine_conn.close()
        return data
    

    except exc.ProgrammingError as e:

        error_message = str(e.args[1]) if len(e.args) > 1 else str(e)

        data={
            "status":400,
            "msg":error_message,
            "data":[],
            "columns":[]
        }
        lclengine_conn.close()
        return data
    

    except exc.OperationalError as e:

        error_message = str(e.args[1]) if len(e.args) > 1 else str(e)

        data={
            "status":400,
            "msg":error_message,
            "data":[],
            "columns":[]
        }
        
        return data
    


def finding(command):

    try:
        print(text(command))
        
        # engine_conn=engine_creation.connect()
        data=engine_conn.execute(text(command))
        column_names = data.keys()
        # rows = [dict(zip(column_names, row)) for row in data.fetchall()]
        rows = [{column_name: row_value if not isinstance(row_value, datetime) else row_value.strftime('%d-%m-%Y %H:%M:%S') for column_name, row_value in zip(column_names, row)} for row in data.fetchall()]
        
        # print(rows,"dsadasdsadsadasdsa")
        # ["lastSendAt","startAt","endAt","nextSendAt","update_time","startAt"]
        
        # if(len(rows)>0):
        #     for i in rows[0]:
        #         print(isinstance(rows[0][i],datetime))
        # dsadasdsa
        
        data={
            "status":200,
            "msg":"Data Get Successfully",
            "data":rows,
            "columns":list(column_names)
        }
        # engine_conn.close()
        return data
    
    except OperationalError as e:

        print(e,"ecscsdcscdscdcdscdc")
        error_message = str(e.args[1]) if len(e.args) > 1 else str(e)

        data={
            "status":400,
            "msg":error_message,
            "data":[]
        }
        # engine_conn.close()
        return data
    
    
    except OperationalError as e:

        print(e,"ecscsdcscdscdcdscdc")
        error_message = str(e.args[1]) if len(e.args) > 1 else str(e)

        data={
            "status":400,
            "msg":error_message,
            "data":[]
        }
        # engine_conn.close()
        return data
    


def findingddf(command):

    try:
        print(text(command))
        
        # engine_conn=engine_creation.connect()
        result=engine_conn.execute(text(command))
        column_names = result.keys()
        # rows = [dict(zip(column_names, row)) for row in data.fetchall()]

        df = pd.DataFrame(result, columns=column_names)
        
        
        
        data={
            "status":200,
            "msg":"Data Get Successfully",
            "data":df,
            "columns":list(column_names)
        }
        # engine_conn.close()
        return data
    
    except OperationalError as e:

        print(e,"ecscsdcscdscdcdscdc")
        error_message = str(e.args[1]) if len(e.args) > 1 else str(e)

        data={
            "status":400,
            "msg":error_message,
            "data":[]
        }
        # engine_conn.close()
        return data




def updating(tablename,columns,values):
    if LOCAL_DEV_MODE:
        where_values = {f"where_{key}": _strip_convert_wrapper(value) for key, value in columns.items()}
        set_values = {key: _strip_convert_wrapper(value) for key, value in values.items()}
        assignments = [f"{key}=:{key}" for key in set_values.keys()]
        assignments.append("update_time=:update_time")
        predicates = [f"{key}= :where_{key}" for key in columns.keys()]

        payload = {**set_values, **where_values, "update_time": _local_dev_now()}
        command = f"UPDATE {tablename} SET {', '.join(assignments)} WHERE {' AND '.join(predicates)}"

        local_conn = engine_creation.connect().execution_options(
            **{"compiled_cache": None, "global_error_handler": global_error_handler}
        )
        local_conn.execute(text(command), payload)
        local_conn.commit()
        local_conn.close()
        return {
            "status": 200,
            "msg": "Data Saved Successfully",
            "data": [],
        }

    print(columns,values)
    print(values.keys(),"skhfksfkjsdhfkjsf")
    # dsadadadsada
    val=[]
    col=[]
    for i in columns:

        final_val=convert_to_int_or_str(columns[i])
        if(type(final_val)==type("abcd") and "cnvrt" in columns[i] and "query" not in values):
            # val=columns[i].replace("cnvrtCONVERT(DATETIME, ","").replace(")cnvrt","").strip()
            # print(val.split(","),i)

            # dsadasdsadas
            # valoi=val.split(",")
            # valoi=valoi[1:-1]
            # column=f"""{i}=:{i}"""
            
            # col.append(column)


            valg=columns[i].replace("cnvrtCONVERT(DATETIME, ","").replace(")cnvrt","").strip()
            print(valg.split(","),i)
            valoi=valg.split(",")
            valo=valoi[0][1:-1]

            print(valoi)

            value=f"""{i}=CONVERT(DATETIME, :{i},{valoi[1]})"""
            val.append(value)
            print(value)
            columns[i]=valo
        else:
            column=f"""{i}=:{i}"""
            col.append(column)


    for i in values:
        final_val=convert_to_int_or_str(values[i])
        if(type(final_val)==type("abcd") and "CONVERT" in values[i] and "query" not in values):

            valg=values[i].replace("cnvrtCONVERT(DATETIME, ","").replace(")cnvrt","").strip()
            print(valg.split(","),i)
            valoi=valg.split(",")
            valo=valoi[0][1:-1]

            print(valoi)

            value=f"""{i}=CONVERT(DATETIME, :{i},{valoi[1]})"""
            val.append(value)
            print(value)
            values[i]=valo
            # dsadsadsadsadsa

        else:
            value=f"""{i}=:{i}"""
            val.append(value)



    print(col,val)
    # dsadasdadasdada
    val.append("update_time=SYSDATETIME()")

    


    command=f"UPDATE {tablename} SET {','.join(val)} WHERE {','.join(col)}"

    print(col,val,command,"sadjhaskjdhasjd")
    # dsadasdasdadasd/
    print(text(command))


    mergedDic={
        **columns,
        **values
    }

    print(mergedDic,"mergedDicmergedDicmergedDic")

    # engine_conn=engine_creation.connect()
    engine_conn=engine_creation.connect().execution_options(
                **{"compiled_cache": None, "global_error_handler": global_error_handler}
            )
    print(command,"commandcommandcommandcommandcommandcommandcommand")
    data=engine_conn.execute(text(command),mergedDic)
    data={
        "status":200,
        "msg":"Data Saved Successfully",
        "data":[]
    }
    engine_conn.commit()
    engine_conn.close()
    return data


def insertion(tablename,total,columns,values):
    if LOCAL_DEV_MODE:
        payload = {key: _strip_convert_wrapper(value) for key, value in total.items()}
        if "id" not in payload:
            payload["id"] = str(uuid.uuid4())
        payload["create_time"] = _local_dev_now()

        insert_columns = list(payload.keys())
        command = f"INSERT INTO {tablename}({','.join(insert_columns)}) VALUES({','.join(f':{column}' for column in insert_columns)})"
        local_conn = engine_creation.connect().execution_options(
            **{"compiled_cache": None, "global_error_handler": global_error_handler}
        )
        local_conn.execute(text(command), payload)
        local_conn.commit()
        local_conn.close()
        return {
            "status": 201,
            "msg": "Data Saved Successfully",
            "data": [],
        }

    print(values,type(values))

    columns=list(columns)

    print(str(values)[:-1]+""+str(values)[-1:],"str(values)")
    # values=str(values)+(SYSDATETIME(),NEWID(),)

    print(','.join(['?']*(len(values)+2)))
    valfinalValues=""
    # finalValues=str(valfinalValues)[:-1]+',SYSDATETIME(),NEWID()'+str(valfinalValues)[-1:]
    for i in total:
        if(type(total[i]) == type("a") and "CONVERT" in total[i] and "query" not in total):

            val=total[i].replace("cnvrtCONVERT(DATETIME, ","").replace(")cnvrt","").strip()
            print("hddjs",val.split(","),i,"asdkjhaksdhsa")
            spval=val.split(",")

            print(spval[0].strip(),spval[1].strip())

            total[i]=spval[0].strip()[1:-1]

            valfinalValues=valfinalValues+"CONVERT(DATETIME, :"+i+", "+spval[1].strip()+"),"
        else:
            valfinalValues=valfinalValues+":"+i+","
        

    valfinalValues=valfinalValues+"SYSDATETIME(),NEWID()"

    command=f"INSERT INTO {tablename}({','.join(columns)},create_time,id) VALUES({valfinalValues})"
    
    command=command.replace('"cnvrt',"")
    command=command.replace('cnvrt"',"")
    print("dkjsfhkjsdhfkjsdhf",text(command),"saddsfjhsdjfhdsd")

    # engine_conn=engine_creation.connect()

    # finalValues=str(values)[:-1]+',SYSDATETIME(),NEWID()'+str(values)[-1:]
    # finalValues=[tuple(list(values)+["SYSDATETIME()","NEWID()"]),]
    # print(text(command),[finalValues],"text(command),finalValues")
    # total["create_time"]='SYSDATETIME()'
    # total["id"]='NEWID()'

    print(command,total)
    data=engine_conn.execute(text(command),total)
    data={
        "status":201,
        "msg":"Data Saved Successfully",
        "data":[]
    }
    engine_conn.commit()
    # engine_conn.close()
    return data


# def insertion(tablename,total,columns,values):

#     print(values,type(values))

#     columns=list(columns)

#     print(str(values)[:-1]+""+str(values)[-1:],"str(values)")
#     # values=str(values)+(SYSDATETIME(),NEWID(),)

#     print(','.join(['?']*(len(values)+2)))
#     valfinalValues=""
#     # finalValues=str(valfinalValues)[:-1]+',SYSDATETIME(),NEWID()'+str(valfinalValues)[-1:]
#     for i in total:
#         if(type(total[i]) == type("a") and "CONVERT" in total[i]):

#             val=total[i].replace("cnvrtCONVERT(DATETIME, ","").replace(")cnvrt","").strip()
#             print(val.split(","),i)
#             spval=val.split(",")

#             print(spval[0].strip(),spval[1].strip())

#             total[i]=spval[0].strip()[1:-1]

#             valfinalValues=valfinalValues+"CONVERT(DATETIME, :"+i+", "+spval[1].strip()+"),"
#         else:
#             valfinalValues=valfinalValues+":"+i+","
        

#     valfinalValues=valfinalValues+"SYSDATETIME(),NEWID()"

#     command=f"INSERT INTO {tablename}({','.join(columns)},create_time,id) VALUES({valfinalValues})"
    
#     command=command.replace('"cnvrt',"")
#     command=command.replace('cnvrt"',"")
#     print(text(command))

#     # engine_conn=engine_creation.connect()

#     # finalValues=str(values)[:-1]+',SYSDATETIME(),NEWID()'+str(values)[-1:]
#     # finalValues=[tuple(list(values)+["SYSDATETIME()","NEWID()"]),]
#     # print(text(command),[finalValues],"text(command),finalValues")
#     # total["create_time"]='SYSDATETIME()'
#     # total["id"]='NEWID()'

#     print(command,total)
#     data=engine_conn.execute(text(command),total)
#     data={
#         "status":201,
#         "msg":"Data Saved Successfully",
#         "data":[]
#     }
#     engine_conn.commit()
#     # engine_conn.close()
#     return data



def insertion_new(tablename,total,columns,values):

    print(values,type(values))

    columns=list(columns)

    print(str(values)[:-1]+""+str(values)[-1:],"str(values)")
    # values=str(values)+(SYSDATETIME(),NEWID(),)

    print(','.join(['?']*(len(values)+2)))
    valfinalValues=""
    # finalValues=str(valfinalValues)[:-1]+',SYSDATETIME(),NEWID()'+str(valfinalValues)[-1:]
    for i in total:
        if(type(total[i]) == type("a") and "CONVERT" in total[i]):

            val=total[i].replace("cnvrtCONVERT(DATETIME, ","").replace(")cnvrt","").strip()
            print(val.split(","),i)
            spval=val.split(",")

            print(spval[0].strip(),spval[1].strip())

            total[i]=spval[0].strip()[1:-1]

            valfinalValues=valfinalValues+"CONVERT(DATETIME, :"+i+", "+spval[1].strip()+"),"
        else:
            valfinalValues=valfinalValues+":"+i+","
        

    valfinalValues=valfinalValues+"SYSDATETIME()"

    command=f"INSERT INTO {tablename}({','.join(columns)},create_time) VALUES({valfinalValues})"
    
    command=command.replace('"cnvrt',"")
    command=command.replace('cnvrt"',"")
    print(text(command))

    # engine_conn=engine_creation.connect()

    # finalValues=str(values)[:-1]+',SYSDATETIME(),NEWID()'+str(values)[-1:]
    # finalValues=[tuple(list(values)+["SYSDATETIME()","NEWID()"]),]
    # print(text(command),[finalValues],"text(command),finalValues")
    # total["create_time"]='SYSDATETIME()'
    # total["id"]='NEWID()'

    print(command,total)
    data=engine_conn.execute(text(command),total)
    data={
        "status":201,
        "msg":"Data Saved Successfully",
        "data":[]
    }
    engine_conn.commit()
    # engine_conn.close()
    return data
     





    # results_list = [dict(row) for row in data]
    # json_output = json.dumps(results_list, indent=2)
    # print(results_list)


# def query_runner(command):

#     data=engine_conn.execute(command)
#     print(data)





# print(engine_conn)

# finding("SHOW TABLES;")
# engine_conn.close()

# print(connection_str)
