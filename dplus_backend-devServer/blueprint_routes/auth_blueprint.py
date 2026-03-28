from base import *

auth_blueprint = Blueprint('auth_blueprint', __name__)

def _local_dev_rows(query, params=None):
    with cso.engine_creation.connect() as conn:
        result = conn.execute(text(query), params or {})
        columns = result.keys()
        rows = [dict(zip(columns, row)) for row in result.fetchall()]
        return {
            "status": 200,
            "msg": "Data Get Successfully",
            "data": rows,
            "columns": list(columns),
        }


   
@auth_blueprint.route('/userList',methods=['GET'])
def userList():
    if getattr(cso, "LOCAL_DEV_MODE", False):
        return _local_dev_rows("""
            SELECT
                Users.id AS value,
                Users.firstname || ' ' || Users.lastname AS label,
                userRole.rolename
            FROM Users
            INNER JOIN userRole ON Users.roleId = userRole.id
            WHERE IFNULL(Users.deleteStatus, 0) = 0
            ORDER BY Users.sid
        """)
    
    sqlQuery="SELECT Users.id AS value,CONCAT(firstname, ' ', lastname)  AS label,rolename FROM Users INNER JOIN userRole ON Users.roleId = userRole.id WHERE Users.deleteStatus=0;"
    
    return cso.finding(sqlQuery)
   
@auth_blueprint.route('/login',methods=['POST'])
def login():

    body = request.get_json()
    print(body)
    sqlQuery=f"SELECT userRole.rolename,userRole.permission,Users.firstname,Users.lastname,Users.username,Users.password,Users.id,Users.roleId,Users.loginType FROM Users INNER JOIN userRole ON Users.roleId = userRole.id WHERE Users.username='{body['username']}' AND Users.deleteStatus=0;"
    print(sqlQuery,"sqlQuery")

    userData=cso.finding(sqlQuery)


    print(userData)


    # dsadsadasdsadas

    # print(len(userData["data"]),userData["data"],userData["data"][0]["password"]==body['password'],"finnded_data")

    if(len(userData["data"])>=1 and userData["data"][0]["password"]==body['password']):

        userData["data"]=userData["data"][0]

        print(userData)


        uniqueid=userData["data"]["id"]
        expisre=datetime.utcnow() + timedelta(days=7)
        userData["data"]["expiresIn"]="36000" #10 Hour session expire 
        expsire=ctm.u_timestamp(timedelta(days=7))
        userData["data"]["expiresTimeStamp"]=expsire 
        roleName=userData["data"]["rolename"]
        print(userData,"userRole")
        # cso.updating("users",{"id":uniqueid},{"isLogin":True,"expiresIn":"36000"})



        token = jwt.encode({'uniqueid': uniqueid, 'exp' : expsire},key=os.environ.get("SECRET_KEY"),algorithm="HS512")  
        # return jsonify({'token' : token.decode('UTF-8')})
        if(type(token)!=type("str")):
            userData["data"]["idToken"]=str(token.decode('UTF-8'))
        else:
            userData["data"]["idToken"]=str(token)
        print(userData,token,"userRole")
        response = make_response()
        
        if(type(token)!=type("str")):
            response.headers['Authorization'] = "Bearer "+str(token.decode('UTF-8'))
        else:
            response.headers['Authorization'] = "Bearer "+str(token)
            
        sqlQuery=f"SELECT * from userConfig where createdBy='{uniqueid}';"
        
        confdata=cso.finding(sqlQuery)["data"]
        confdict={}
        for i in confdata:
            confdict[i["configName"]]=i["configValue"]
        
        response.data = json.dumps(userData["data"])
        print(response,"responseresponse")
        # log_manager.response(response)

        userData["data"]["confdata"]=confdict
        userData["status"]=200
        return respond(userData)

    else:
        userData["status"]=400
        userData["msg"]="Please Use Valid Credentials"

        return respond(userData)
    

# @auth_blueprint.route('/get_my_conf',methods=['GET'])
# @token_required
def get_user_all_details(current_user):

    # sqlQuery=f"SELECT userRole.rolename,userRole.permission,Users.firstname,Users.lastname,Users.username,Users.password,Users.id,Users.roleId,Users.loginType FROM Users INNER JOIN userRole ON Users.roleId = userRole.id WHERE Users.id='{current_user['id']}' AND Users.deleteStatus=0;"
    # print(current_user,"sqlQuery")
    

    # userData=cso.finding(sqlQuery)


    # print(userData)
    
    
    sqlQuery=f"SELECT * from userConfig where createdBy='{current_user['id']}';"
    
    confdata=cso.finding(sqlQuery)["data"]
    
    print(confdata)
    confdict={}
    for i in confdata:
        confdict[i["configName"]]=i["configValue"]
    
    return confdict


    # dsadsadsads


    # dsadsadasdsadas

    # print(len(userData["data"]),userData["data"],userData["data"][0]["password"]==body['password'],"finnded_data")

    # if(len(userData["data"])>=1 and userData["data"][0]["password"]==body['password']):

    #     userData["data"]=userData["data"][0]

    #     print(userData)


    #     uniqueid=userData["data"]["id"]
    #     expisre=datetime.utcnow() + timedelta(days=7)
    #     userData["data"]["expiresIn"]="36000" #10 Hour session expire 
    #     expsire=ctm.u_timestamp(timedelta(days=7))
    #     userData["data"]["expiresTimeStamp"]=expsire 
    #     roleName=userData["data"]["rolename"]
    #     print(userData,"userRole")
    #     # cso.updating("users",{"id":uniqueid},{"isLogin":True,"expiresIn":"36000"})



    #     token = jwt.encode({'uniqueid': uniqueid, 'exp' : expsire},key=os.environ.get("SECRET_KEY"),algorithm="HS512")  
    #     # return jsonify({'token' : token.decode('UTF-8')})
    #     if(type(token)!=type("str")):
    #         userData["data"]["idToken"]=str(token.decode('UTF-8'))
    #     else:
    #         userData["data"]["idToken"]=str(token)
    #     print(userData,token,"userRole")
    #     response = make_response()
        
    #     if(type(token)!=type("str")):
    #         response.headers['Authorization'] = "Bearer "+str(token.decode('UTF-8'))
    #     else:
    #         response.headers['Authorization'] = "Bearer "+str(token)
            
    #     sqlQuery=f"SELECT * from userConfig where createdBy='{uniqueid}';"
        
    #     confdata=cso.finding(sqlQuery)["data"]
    #     confdict={}
    #     for i in confdata:
    #         confdict[i["configName"]]=i["configValue"]
        
    #     response.data = json.dumps(userData["data"])
    #     print(response,"responseresponse")
    #     # log_manager.response(response)

    #     userData["data"]["confdata"]=confdict
    #     userData["status"]=200
    #     return respond(userData)

    # else:
    #     userData["status"]=400
    #     userData["msg"]="Please Use Valid Credentials"

    #     return respond(userData)
    
@auth_blueprint.route('/setupConf',methods=['GET',"POST","PUT","PATCH","DELETE"])
@token_required
def setupConf(current_user,uniqueId=None):

    if(request.method=="POST"):
        dataAll=request.get_json()
        
        # print(dataAll,"dataAll")
        
        for i in dataAll:
            
            # print(i)
            
            
            
            print(f"select * from userConfig where configName='{i}' AND createdBy='{current_user['id']}'")
            olddata=cso.finding(f"select * from userConfig where configName='{i}' AND createdBy='{current_user['id']}'")["data"]
            
            print(olddata,"olddataolddataolddata")
            
            if(len(olddata)>0):
                dataA={
                    "configValue":dataAll[i],
                    "createdBy":current_user['id'],
                }
                
                # print("userConfig",{"id":olddata[0]['id']},dataA)
                # dasdsadsadssd
                userData=cso.updating("userConfig",{"id":olddata[0]['id']},dataA)
                
                # return respond(userData)
                # print("update")
            else:
                dataA={
                    "configName":i,
                    "configValue":dataAll[i],
                    "createdBy":current_user['id'],
                    
                }
                # print(dataA,"dataAdataA")
                
                # dasdasdasdas
                userData=cso.insertion("userConfig",total=dataA,columns=list(dataA.keys()),values=tuple(dataA.values()))
                
               
                # print("insert")
            
        # print(olddata)
        
        olddata=cso.finding(f"select * from userConfig where createdBy='{current_user['id']}'")
        
        finD={}
        for i in olddata["data"]:
            print(i)
            finD[i["configName"]]=i["configValue"]
        
        
        olddata["data"]=finD
        
        return respond(olddata)
    
        
        
        

        # # dataAll["endAt"]=f"cnvrtCONVERT(DATETIME, '{dataAll['endAt']}', 127)cnvrt"
        # dataAll["createdBy"]=current_user['id']
        
        # print(dataAll)
        
        # userData=cso.insertion("userConfig",total=dataAll,columns=list(dataAll.keys()),values=tuple(dataAll.values()))
        # return respond(userData)


   
