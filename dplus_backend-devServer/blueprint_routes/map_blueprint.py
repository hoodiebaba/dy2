from base import *

map_blueprint = Blueprint('map_blueprint', __name__)


mark = ()
def calculate_distance(coord1, coord2):
    # Calculate the distance between two sets of coordinates
    distance = geodesic(coord1, coord2).km
    return distance


def performOps(data,capacity):

    global mark
    # print(data["LATITUDE"],mark,capacity)
    dataa=[]

    distance_between_markers=""
    if(len(mark)>0):
        current_row = data
        marker1 = (data["LATITUDE"],data['LONGITUDE'])
        # distance_between_markers = calculate_distance(tuple(mark),marker1)
        distance_between_markers = calculate_distance(tuple(mark),marker1)
        # return distance_between_markers
        # print(distance_between_markers,tuple(mark),marker1)
        if(distance_between_markers>capacity):
            mark=marker1
            return distance_between_markers
        else:
            return None
        
    else:
        mark=(data["LATITUDE"],data['LONGITUDE'])
        
        return None
    

# data['RESULT'] = data.apply(performOps,args=(50,), axis=1)
    
    # for i in range(len(data) - 1):
    #     current_row = data.iloc[i]
    #     next_row = data.iloc[i + 1]
    #     # marker1 = (current_row['LATITUDE'], current_row['LONGITUDE'])
    #     marker2 = (next_row['LATITUDE'], next_row['LONGITUDE'])

        
    #     distance_between_markers = calculate_distance(marker1, marker2,dataa)

        
    #     if(distance_between_markers>capacity):
    #         dataa.append([distance_between_markers])
    return distance_between_markers




def process_row(row):
    lat = row['LATITUDE']
    long = row['LONGITUDE']
    key_str = f"{lat}_{long}"
    formatted_data = {
        "LATITUDE": lat,
        "LONGITUDE": long,
        "RESULT": row['RESULT']
    }
    # formatted_data["RESULT"] = performOps(formatted_data, 50)
    # performOps(formatted_data, 50)
    return key_str, formatted_data



@map_blueprint.route('/allFilterList',methods=['GET',"POST","PUT","PATCH","DELETE"])
@map_blueprint.route('/allFilterList/<uniqueId>',methods=['GET',"POST","PUT","PATCH","DELETE"])
@token_required
def allFilterList(current_user,uniqueId=None):

    print(request.method,"request.method")
    if(request.method=="GET"):
        argu=request.args
        arew=apireq.argstostr(argu)
        sql_conn_obj=sconf.sql_conn_obj()
        sqlQuerytech=f"SELECT TOP (1000) [BAND] AS name,color AS bgColor,textColor AS textColor,[technology]+'_sp_'+[BAND] AS indexi ,[technology] AS parentName FROM [KPI_Gids].[dbo].[arc_setting_demo];"
        sqlQueryregion=f"SELECT DISTINCT(Region) AS indexi,Region AS name FROM [KPI_Gids].[gid].[Cell_GIS];"
        
        
        techdata=cso.findFromDifferentServer(sql_conn_obj,sqlQuerytech)
        regiondata=cso.findFromDifferentServer(sql_conn_obj,sqlQueryregion)
        # print(regiondata,'rdddd')
        # print(techdata,'techdata')
        selectiondata=techdata["data"]
        regionselectiondata=regiondata["data"]

        # for i in selectiondata:
        #     print(i)


        allGrouped=selectiondata.groupby(['parentName'])

        final_groups=[]
        ctt=0
        for i in allGrouped:
            # print()
            ctt=ctt+1
            final_groups.append({
                "columnName":cfc.dfjson(i[1]),
                "name":str(i[0][0]),
                "parentName":str(i[0][0]),
                "index":ctt
            })

        newData=[
            {
                "columnName":final_groups,
                "name":"Technology",
                "parentName":"Technoplogy"
            }
        ]
        
        final_filt=[{
                    "parent":"Technology",
                    "child":final_groups
                },{
                    "parent":"Demographics",
                    "child":[{
                        "columnName":cfc.dfjson(regionselectiondata),
                        "name":"Region",
                        "parentName":"Region",
                        "index":len(final_groups)+1
                    }]
                }]
        # print(final_groups)
        data={
            "status":200,
            "data":{  
                "d1":final_filt
           },
            "msg":""
        }
     
        # allGrouped=selectiondata.groupby(['technology'])

        # final_groups={}
        # for i in allGrouped:

        #     print()
        #     final_groups[str(i[0][0])]=cfc.dfjson(i[1])

        # print(selectiondata,"data")

        return respond(data)
    

@map_blueprint.route('/techwithband',methods=['GET',"POST","PUT","PATCH","DELETE"])
@map_blueprint.route('/techwithband/<uniqueId>',methods=['GET',"POST","PUT","PATCH","DELETE"])
@token_required
def techwithband(current_user,uniqueId=None):

    print(request.method,"request.method")
    if(request.method=="GET"):
        argu=request.args
        arew=apireq.argstostr(argu)
        
        sql_conn_obj=sconf.sql_conn_obj()
        sqlQuery=f"SELECT TOP (1000) [BAND] AS name,[technology]+'_sp_'+[BAND] AS id ,[technology] AS category FROM [KPI_Gids].[dbo].[arc_setting_demo];"
        
        data=cso.findFromDifferentServer(sql_conn_obj,sqlQuery)

        print(data)
        selectiondata=data["data"]


        
        # allGrouped=selectiondata.groupby(['technology'])

        # final_groups={}
        # for i in allGrouped:

        #     print()
        #     final_groups[str(i[0][0])]=cfc.dfjson(i[1])

        # print(selectiondata,"data")

        data["data"]=cfc.dfjson(selectiondata)
        return respond(data)
    

    elif(request.method=="POST"):
        dataAll=request.get_json()

        # dataAll["Query"]=dataAll["Query"].replace("\n"," ")

        print(dataAll)
        # dsadsadasdad


        # dataAll["endAt"]=f"cnvrtCONVERT(DATETIME, '{dataAll['endAt']}', 127)cnvrt"
        dataAll["createdBy"]=current_user['id']
        userData=cso.insertion("proRules",total=dataAll,columns=list(dataAll.keys()),values=tuple(dataAll.values()))
        return respond(userData)
        
    elif(request.method=="PUT"):
        dataAll=request.get_json()
        
        # dataAll["Query"]=dataAll["Query"].replace("\n"," ")
        
        dataAll["createdBy"]=current_user['id']
        dataAll=del_itm(dataAll,["create_time","update_time","id"])

        

        print(dataAll)
        # print(dasdadaada)
        userData=cso.updating("proRules",{"id":uniqueId},dataAll)
        return respond(userData)
    
    elif(request.method=="PATCH"):
        dataAll=request.get_json()
        userData=cso.updating("proRules",{"id":uniqueId},dataAll)
        return respond(userData)
        
    
    elif(request.method=="DELETE"):

        print(uniqueId)

        cso.updating("proRules",{"id":uniqueId},{"deleteStatus":1})
        return {
            
        }
    


@map_blueprint.route('/map/getChart',methods=['GET',"POST","PUT","PATCH","DELETE"])
def map_getChart():
    if(request.method=="POST"):
        argu=request.get_json()
        
        # print(argu)
        
        listOfArr=[
            {
                "name":"CS Traffic",
                "query":"CS_TRAffic",
            },{
                "name":"Availability",
                "query":"TCH_Availability",
            },{
                "name":"DL Volume",
                "query":"DL_Volume",
            },{
                "name":"UL Volume",
                "query":"UL_Volume",
            },{
                "name":"TCH Drop Rate",
                "query":"TCH_Drops",
            },{
                "name":"Voice CSSR",
                "query":"CSSR",
            },{
                "name":"Data Success Rate",
                "query":"DATA_SR",
            },{
                "name":"Ultilization",
                "query":"Ultilization",
            }
        ]
        
        getv=[]
        
        for kk in listOfArr:
            getv.append(kk["query"])
        
        sql_conn_obj=sconf.sql_conn_obj()
        getter={}
        
        
        
        # print(ctm.ymdtimezone(),ctm.ymdtimezone(3))
        
        
        
        
        # sqlQuerying=f"SELECT TOP (1000) starttime , Cell_name,[CS_TRAffic],[TCH_Availability],[DL_Volume],[UL_Volume],[TCH_Drops] ,[CSSR] ,[DATA_SR] ,[Ultilization] FROM [KPI_Multi_Vendor].[kpi].[Dashboard_KPIs_Hourly] t1 inner join [KPI_Gids].[gid].[KPI_Cell_gids] t2 on (t1.did = t2.did) where  [starttime] > '2024-01-11 00:00:00.000'  and  Cell_name = '{argu['Cell_name']}'"
        # sqlQuerying=f"SELECT TOP (1000) starttime , Cell_name AS name,{', '.join(getv)} FROM [KPI_Multi_Vendor].[kpi].[Dashboard_KPIs_Hourly] t1 inner join [KPI_Gids].[gid].[KPI_Cell_gids] t2 on (t1.did = t2.did) where  [starttime] > '2024-01-11 00:00:00.000'  and  Cell_name = '19581_WN_WN0915-ATC_Kisumu_Nanga-0'"
        sqlQuerying=f"SELECT TOP (100000) starttime , Cell_name AS name,{', '.join(getv)} FROM [KPI_Multi_Vendor].[kpi].[Dashboard_KPIs_Hourly] t1 inner join [KPI_Gids].[gid].[KPI_Cell_gids] t2 on (t1.did = t2.did) where  [starttime] > '{ctm.ymdtimezone(3)} 00:00:00.000'  and  Cell_name = '{argu['Cell_name']}'"
        
        
        # print(sqlQuerying)
        # dasdsadsadsa
        
        data=cso.findFromDifferentServer(sql_conn_obj,sqlQuerying)["data"]
        
        print(data,"datadatadatadata")
        
        dataa={
            "status":400,
            "msg":"No Data Found",
            "icon":"error",
            "data":{}
        }
        
        # print(data)
        # print(data)
        
        # dsadasdas
        if(len(data)>0):
        
            data['starttime'] = pd.to_datetime(data['starttime'], errors='coerce')  ###addedd for chart fix na
            data = data.dropna(subset=['starttime'])    ###addedd for chart fix na
            data=data.sort_values("starttime")
            print(data["starttime"],"starttimemeemmememe")
            data['starttime'] = data["starttime"].dt.strftime("%Y/%m/%d %H:%M")
            
            data = data.replace({np.nan: None})   # ✅ ADD THIS LINE

            for i in listOfArr:
                # sqlQuerying=f"""SELECT TOP (1000) starttime,Cell_name AS name, {i["query"]} AS value FROM [KPI_Multi_Vendor].[kpi].[Dashboard_KPIs_Hourly] t1 inner join [KPI_Gids].[gid].[KPI_Cell_gids] t2 on (t1.did = t2.did) where  [starttime] > '2024-01-11 00:00:00.000'  and  Cell_name = '{argu["Cell_name"]}'"""
                
                # print(sqlQuerying,"sqlQuerying")
                # data=cso.findFromDifferentServer(sql_conn_obj,sqlQuerying)["data"]
                
                # print(data[["starttime","name",i["query"]]],"datadatadata")
                
                
                
                finalOne=data[["starttime","name",i["query"]]]
                
                finalOne["value"]=finalOne[i["query"]]
                
                
                
                getter[i["name"]]=cfc.dfjson(finalOne)
            
            dataa={
                "status":200,
                "msg":"200",
                "data":{
                    "value":getter,
                    "name":argu["Cell_name"]
                }
            }
            

            # print(finalOne)
            
            
       
        
        return respond(dataa)
    

@map_blueprint.route('/map/savelatlong',methods=['GET',"POST","PUT","PATCH","DELETE"])
@token_required
def map_getMarker(current_user):
    
    
    if(request.method=="GET"):
        
        
        return 
    
    elif(request.method=="POST"):
        dataAll=request.get_json()
        # print(dataAll,current_user["id"])
        return 
    
    return 

@map_blueprint.route('/map/getMarker',methods=['GET',"POST","PUT","PATCH","DELETE"])
@map_blueprint.route('/map/getMarker/<uniqueId>',methods=['GET',"POST","PUT","PATCH","DELETE"])
def configureAlert(uniqueId=None):
    
    a=time.time()
    # print(request.method,"request.method")
    if(request.method=="GET"):
        



        # Example coordinates
        marker1 = (-0.0255064, 34.7444)
        marker2 = (-0.561143, 33.9285)

        sqlQuery = """SELECT DISTINCT [LATITUDE],[LONGITUDE] FROM [KPI_Gids].[gid].[Cell_GIS] order by Latitude ASC, Longitude;""" 

        a=time.time()
        
        
        sql_conn_obj=sconf.sql_conn_obj()
        data=cso.findFromDifferentServer(sql_conn_obj,sqlQuery)["data"]

        b=time.time()
        print(b-a)
        data['RESULT'] = data.apply(performOps,args=(50,), axis=1)
        data=data[data['RESULT'].isna()!=True]
        # print(data,"data")
        final_groups={}

        a=time.time()
        # def process_row(row,kmrad):
        #     lat = row['LATITUDE']
        #     long = row['LONGITUDE']
        #     key_str = f"{lat}_{long}"
        #     checkval=performOps(row, kmrad)

        #     if checkval!=None:    
        #         final_groups[key_str] = {
        #             "LATITUDE": lat,
        #             "LONGITUDE": long,
        #             "RESULT": checkval
        #         }

        # data.apply(process_row,args=(50,), axis=1)


        # b=time.time()
        # print(b-a)
        # print(len(data))

        
        # final_groups={}
        # for index, row in data.iterrows():

        #     lat = row['LATITUDE']
        #     long = row['LONGITUDE']
        #     key_str = f"{lat}_{long}"
        #     formatted_data = {
        #         "LATITUDE": lat,
        #         "LONGITUDE": long,
        #         "RESULT":row['RESULT']
        #     }
        #     # formatted_data["RESULT"]=performOps(formatted_data,50)

        #     # performOps(formatted_data,50)

        #     # print(oldData,"oldData")
        #     # if(formatted_data["RESULT"]!=None):
        #     final_groups[key_str] = formatted_data

        b=time.time()
        print(b-a)

        a=time.time()


        # Assuming 'data' is your DataFrame
        final_groups = dict(data.apply(process_row, axis=1).tolist())



        b=time.time()
        print(b-a)

        
        # allGrouped=data.groupby(['LATITUDE', 'LONGITUDE'])

        # final_groups={}
        # for i in allGrouped:
        #     final_groups[str(i[0][0])+"_"+str(i[0][1])]=cfc.dfjson(i[1])
        # print(sqlQuery)
        # for i in data:

        #     final_groups[str(i[0][0])+"_"+str(i[0][1])]=cfc.dfjson(i[1])
        
            # print(f"Row {i + 1}:")
            # print(f"  Current: LATITUDE={current_row['LATITUDE']}, LONGITUDE={current_row['LONGITUDE']}")
            # print(f"  Next:    LATITUDE={next_row['LATITUDE']}, LONGITUDE={next_row['LONGITUDE']}")
            # print()
        # allGrouped=data.groupby(['LATITUDE', 'LONGITUDE'])
        # a=time.time()
        # dataa=[]
        # for i in range(10000):
                
        #     # Calculate the distance between the two markers
        #     distance_between_markers = calculate_distance(marker1, marker2,dataa)
        #     # print(distance_between_markers)
        # b=time.time()

        return {"data":final_groups}



#         argu=request.args

#         # print(argu,"arguarguarguargu")
#         # arew=apireq.argstostr(argu)


# #         sqlQuery="""DECLARE @geofenceLatitude FLOAT = {lat};
# # DECLARE @geofenceLongitude FLOAT = {long};
# # DECLARE @geofenceRadius FLOAT = {radius};
# # SELECT * FROM (SELECT T1.Cell_name,T1.BAND,T1.Azimuth,T1.LATITUDE,T1.LONGITUDE,T1.Technology,T2.length,T2.orderRing,T2.beamWidth,T2.color, 
# # CASE WHEN ABS(LATITUDE - @geofenceLatitude) <= @geofenceRadius AND ABS(LONGITUDE - @geofenceLongitude) <= @geofenceRadius THEN 'Inside' ELSE 'Outside' END AS GeofenceStatus 
# # FROM gid.Cell_GIS AS T1 INNER JOIN dbo.arc_setting_demo T2 on T1.Technology=T2.Technology AND T1.BAND=T2.BAND) as DATA where GeofenceStatus = 'Inside'
# # """.format(lat="-0.0255064",long="34.7444",radius="0.010")
        

        

#         sqlQuery="SELECT DISTINCT Physical_id,LATITUDE,LONGITUDE FROM [KPI_Gids].[gid].[Cell_GIS] order by LATITUDE ASC,LONGITUDE ASC"
        

#         print(sqlQuery)



#         # Cell_Name like '%_nw%' AND 
#         #   WHERE T1.Site_Name LIKE '%15227%'
#         # sqlQuery = """SELECT TOP 1000 T1.Cell_name,T1.BAND,T1.Azimuth,T1.LATITUDE,T1.LONGITUDE,T1.Technology,T2.length,T2.orderRing,T2.beamWidth,T2.color FROM gid.Cell_GIS AS T1 INNER JOIN dbo.arc_setting_demo T2 on T1.Technology=T2.Technology AND T1.BAND=T2.BAND AND Cell_name like '%15227%';""" 

#         sql_conn_obj={
#             "dbName": "KPI_Gids",
#             "dbServer" : "192.168.0.120",
#             "port": "1433",
#             "dbtype": "MSSQL",
#             "password" : "Dy@123",
#             "username" : "dy",
#         }
#         data=cso.findFromDifferentServer(sql_conn_obj,sqlQuery)["data"]
#         allGrouped=data.groupby(['LATITUDE', 'LONGITUDE'])

#         final_groups={}
#         for i in allGrouped:
#             final_groups[str(i[0][0])+"_"+str(i[0][1])]=cfc.dfjson(i[1])

#         # final_groups = (data.groupby(['LATITUDE', 'LONGITUDE']).apply(lambda group: cfc.dfjson(group)).to_dict())

#         # print(final_groups)
            

#         # for i in final_groups:
#         #     print(i)
            

#         # print(allGrouped)

        


#         # data.

        
        
#         return {"data":final_groups}
    


    elif(request.method=="POST"):
        argu=request.get_json()

        # print(argu,"arguarguarguargu")

        sqlQuery=""""""


        tech=["2G","3G","4G","5G"]
        techcomp=argu["dataValue"]
        completeQ=[]
        techData=[]
        techeData=[]
        for i in techcomp:

            lclData=[]
            if(i in tech):
                techeData.append(f"T1.Technology='{i}'")
                for j in techcomp[i]:
                    techData.append(f"T1.BAND='{j}'")

            else:
                for j in techcomp[i]:
                    lclData.append(f"T1.{i}='{j}'")

                if(len(lclData)>0):
                    completeQ.append(f'({" OR ".join(lclData)})')
        
        if(len(techData)>0):
            completeQ.append(f'({" OR ".join(techData)})')
        
        if(len(techeData)>0):
            completeQ.append(f'({" OR ".join(techeData)})')
            # completeQ.append(" OR ".join())
        

        # print(" AND ".join(completeQ),completeQ,"completeQ")
            
        filer=" AND ".join(completeQ)
        
        
        





        radian={
            18:0.005,
            17:0.010,
            16:0.030,
            15:0.060,
            14:0.070,
            13:0.200,
            12:0.400,
            11:0.600,
            10:0.800,
            9:1.000,
            8:1.070,
            7:1.100,
            6:1.400,
            5:1.700,
            4:1.000,
            3:2.000,
            2:3.000,
            1:4.000, 
            0:5.000, 
        }
        
        kmdiff={
            13:10,
            12:20,
            11:30,
            10:40,
            9:50,
            8:100,
            7:150,
            6:300,
            5:400,
            4:500,
            3:600,
            2:700,
            1:800,
            0:900, 
        }

        
        sql_conn_obj=sconf.sql_conn_obj()
        
        
        # if(int(argu["radius"])>13):

        # sqlQuery="SELECT * FROM (SELECT T1.Cell_name,T1.BAND,T1.Azimuth,T1.LATITUDE AS LATITUDE,T1.LONGITUDE AS LONGITUDE,T1.Technology,T1.Node_Name,T2.length,T2.len_height,T2.orderRing,T2.beamWidth,T2.color FROM gid.Cell_GIS AS T1 INNER JOIN dbo.arc_setting_demo T2 on T1.Technology=T2.Technology AND T1.BAND=T2.BAND WHERE T1.LONGITUDE='33.9285011292' AND T1.LATITUDE='-0.5611429811') as DATA;".format(whword=" WHERE "+filer if filer!="" else "")
        sqlQuery=f'SELECT * FROM (SELECT T1.Site_Name,T1.Physical_id,T1.Cell_name,T1.BAND,T1.Azimuth,T1.Region,T1.LATITUDE AS LATITUDE,T1.LONGITUDE AS LONGITUDE,T1.Technology,T1.Node_Name,T2.length,T2.len_height,T2.orderRing,T2.beamWidth,T2.color FROM gid.Cell_GIS AS T1 INNER JOIN dbo.arc_setting_demo T2 on T1.Technology=T2.Technology AND T1.BAND=T2.BAND  {(" WHERE "+filer if filer!="" else "")}) as DATA;'
        
        
        # print(sqlQuery,"sqlQuerysqlQuery")
        
        # dsadasdasdas
        
#             sqlQuery="""DECLARE @geofenceLatitude FLOAT = {lat};
# DECLARE @geofenceLongitude FLOAT = {long};
# DECLARE @geofenceRadius FLOAT = {radius};
# SELECT * FROM (SELECT T1.Cell_name,T1.BAND,T1.Azimuth,T1.LATITUDE,T1.LONGITUDE,T1.Technology,T1.Node_Name,T2.length,T2.orderRing,T2.beamWidth,T2.color, 
# CASE WHEN ABS(LATITUDE - @geofenceLatitude) <= @geofenceRadius AND ABS(LONGITUDE - @geofenceLongitude) <= @geofenceRadius THEN 'Inside' ELSE 'Outside' END AS GeofenceStatus 
# FROM gid.Cell_GIS AS T1 INNER JOIN dbo.arc_setting_demo T2 on T1.Technology=T2.Technology AND T1.BAND=T2.BAND {filer}) as DATA where GeofenceStatus = 'Inside'
# """.format(lat=argu["lat"],long=argu["lng"],radius=radian[argu["radius"]],filer=" WHERE "+filer if filer!="" else "")
        
        
        # print(sqlQuery,"sqlQuerysqlQuery")
        
        
        data=cso.findFromDifferentServer(sql_conn_obj,sqlQuery)["data"]

        # print(data,"datadatadata")

        # dasdadadasdasdasdsa
        # allGrouped=data.groupby(['LATITUDE', 'LONGITUDE'])

        final_groups={}

        final_groups=cfc.dfjson(data)

        # for i in allGrouped:

        #     # print(i)
        #     final_groups[str(i[0][0])+"_"+str(i[0][1])]=cfc.dfjson(i[1])
        
        b=time.time()
        print(b-a)
        return {"data":final_groups,"type":"U"}
        
        # elif(int(argu["radius"])<=13 and int(argu["radius"])>9):

        #     # sqlQuery="""SELECT DISTINCT TOP(200) T1.LATITUDE AS LATITUDE, T1.LONGITUDE AS LONGITUDE FROM gid.Cell_GIS AS T1;"""
        #     sqlQuery="""DECLARE @geofenceLatitude FLOAT = {lat};
        #     DECLARE @geofenceLongitude FLOAT = {long};
        #     DECLARE @geofenceRadius FLOAT = {radius};
        #     SELECT * FROM (SELECT DISTINCT T1.LATITUDE AS LATITUDE,T1.LONGITUDE AS LONGITUDE, 
        #     CASE WHEN ABS(LATITUDE - @geofenceLatitude) <= @geofenceRadius AND ABS(LONGITUDE - @geofenceLongitude) <= @geofenceRadius THEN 'Inside' ELSE 'Outside' END AS GeofenceStatus 
        #     FROM gid.Cell_GIS AS T1 INNER JOIN dbo.arc_setting_demo T2 on T1.Technology=T2.Technology AND T1.BAND=T2.BAND) as DATA where GeofenceStatus = 'Inside'
        #     """.format(lat=argu["lat"],long=argu["lng"],radius=radian[argu["radius"]])
            
        #     data=cso.findFromDifferentServer(sql_conn_obj,sqlQuery)["data"]

        #     print(data)
        #     allGrouped=data.groupby(['LATITUDE', 'LONGITUDE'])

        #     final_groups={}
        #     for i in allGrouped:
        #         final_groups[str(i[0][0])+"_"+str(i[0][1])]=cfc.dfjson(i[1])
        #     print(sqlQuery)
        
        #     return {"data":final_groups,"type":"S"}

#             sqlQuery="SELECT DISTINCT TOP(200) Physical_id,LATITUDE,LONGITUDE FROM [KPI_Gids].[gid].[Cell_GIS] order by LATITUDE ASC,LONGITUDE ASC"
# #             sqlQuery="""
# # DECLARE @centerLatitude FLOAT = {lat};
# # DECLARE @centerLongitude FLOAT =  {long};
# # DECLARE @radius FLOAT = {radius};

# # SELECT DISTINCT 
# #     Latitude, 
# #     Longitude
# # FROM gid.Cell_GIS
# # WHERE 
# # 	6371 * 2 * 
# # 	ASIN(SQRT(POWER(SIN(RADIANS(Latitude - @centerLatitude) / 2), 2) + 
# # 	COS(RADIANS(@centerLatitude)) * COS(RADIANS(Latitude)) * 
# # 	POWER(SIN(RADIANS(Longitude - @centerLongitude) / 2), 2))) <= @radius;

# # """.format(lat=argu["lat"],long=argu["lng"],radius=radian[argu["radius"]])
            

#             print(sqlQuery,"sqlQuerysqlQuery")
            
            
#             data=cso.findFromDifferentServer(sql_conn_obj,sqlQuery)["data"]


#             print(data)

#             allGrouped=data.groupby(['LATITUDE', 'LONGITUDE'])

#             marker_data=data
            # from geopy.distance import geodesic

            # # Assuming your dataframe is named 'df' and has 'latitude' and 'longitude' columns

            # # Example dataframe
            # # data = {'latitude': [34.0522, 40.7128, 41.8781, 37.7749],
            # #         'longitude': [-118.2437, -74.0060, -87.6298, -122.4194]}
            # df = data
            # # Function to calculate distance between two points
            # def calculate_distance(point1, point2):
            #     return geodesic(point1, point2).km

            # # Initialize an empty list to store unique marker locations
            # unique_marker_locations = []

            # # Iterate over the dataframe rows
            # for index, row in df.iterrows():
            #     current_location = (row['LATITUDE'], row['LONGITUDE'])
                
            #     # Check if the current location is at least 10 km away from all previous unique locations
            #     is_unique_location = all(calculate_distance(current_location, marker_location) >= 10
            #                             for marker_location in unique_marker_locations)
                
            #     # If the current location is unique, add it to the list
            #     if is_unique_location:
            #         unique_marker_locations.append(list(current_location))

            # # Print the unique marker locations
            # print(unique_marker_locations)
            # final_groups={}
            # for i in unique_marker_locations:
            #     final_groups[str(i[0])+"_"+str(i[1])]=i
            
        
            # return {"data":final_groups,"type":"S"}

#         if(int(argu["radius"])>13):

#             sqlQuery="SELECT TOP 10 * FROM (SELECT T1.Cell_name,T1.BAND,T1.Azimuth,T1.LATITUDE AS LATITUDE,T1.LONGITUDE AS LONGITUDE,T1.Technology,T1.Node_Name,T2.length,T2.len_height,T2.orderRing,T2.beamWidth,T2.color FROM gid.Cell_GIS AS T1 INNER JOIN dbo.arc_setting_demo T2 on T1.Technology=T2.Technology AND T1.BAND=T2.BAND {whword}) as DATA;".format(whword={" WHERE "+filer if filer!="" else ""})
# #             sqlQuery="""DECLARE @geofenceLatitude FLOAT = {lat};
# # DECLARE @geofenceLongitude FLOAT = {long};
# # DECLARE @geofenceRadius FLOAT = {radius};
# # SELECT * FROM (SELECT T1.Cell_name,T1.BAND,T1.Azimuth,T1.LATITUDE,T1.LONGITUDE,T1.Technology,T1.Node_Name,T2.length,T2.orderRing,T2.beamWidth,T2.color, 
# # CASE WHEN ABS(LATITUDE - @geofenceLatitude) <= @geofenceRadius AND ABS(LONGITUDE - @geofenceLongitude) <= @geofenceRadius THEN 'Inside' ELSE 'Outside' END AS GeofenceStatus 
# # FROM gid.Cell_GIS AS T1 INNER JOIN dbo.arc_setting_demo T2 on T1.Technology=T2.Technology AND T1.BAND=T2.BAND {filer}) as DATA where GeofenceStatus = 'Inside'
# # """.format(lat=argu["lat"],long=argu["lng"],radius=radian[argu["radius"]],filer=" WHERE "+filer if filer!="" else "")
            
            
#             print(sqlQuery,"sqlQuerysqlQuery")
            
            
#             data=cso.findFromDifferentServer(sql_conn_obj,sqlQuery)["data"]

#             # print(data,"datadatadata")

#             # dasdadadasdasdasdsa
#             # allGrouped=data.groupby(['LATITUDE', 'LONGITUDE'])

#             final_groups={}

#             final_groups=cfc.dfjson(data)

#             # for i in allGrouped:

#             #     # print(i)
#             #     final_groups[str(i[0][0])+"_"+str(i[0][1])]=cfc.dfjson(i[1])
            
#             b=time.time()
#             print(b-a)
#             return {"data":final_groups,"type":"U"}
        
#         # elif(int(argu["radius"])<=13 and int(argu["radius"])>9):

#         #     # sqlQuery="""SELECT DISTINCT TOP(200) T1.LATITUDE AS LATITUDE, T1.LONGITUDE AS LONGITUDE FROM gid.Cell_GIS AS T1;"""
#         #     sqlQuery="""DECLARE @geofenceLatitude FLOAT = {lat};
#         #     DECLARE @geofenceLongitude FLOAT = {long};
#         #     DECLARE @geofenceRadius FLOAT = {radius};
#         #     SELECT * FROM (SELECT DISTINCT T1.LATITUDE AS LATITUDE,T1.LONGITUDE AS LONGITUDE, 
#         #     CASE WHEN ABS(LATITUDE - @geofenceLatitude) <= @geofenceRadius AND ABS(LONGITUDE - @geofenceLongitude) <= @geofenceRadius THEN 'Inside' ELSE 'Outside' END AS GeofenceStatus 
#         #     FROM gid.Cell_GIS AS T1 INNER JOIN dbo.arc_setting_demo T2 on T1.Technology=T2.Technology AND T1.BAND=T2.BAND) as DATA where GeofenceStatus = 'Inside'
#         #     """.format(lat=argu["lat"],long=argu["lng"],radius=radian[argu["radius"]])
            
#         #     data=cso.findFromDifferentServer(sql_conn_obj,sqlQuery)["data"]

#         #     print(data)
#         #     allGrouped=data.groupby(['LATITUDE', 'LONGITUDE'])

#         #     final_groups={}
#         #     for i in allGrouped:
#         #         final_groups[str(i[0][0])+"_"+str(i[0][1])]=cfc.dfjson(i[1])
#         #     print(sqlQuery)
        
#         #     return {"data":final_groups,"type":"S"}

# #             sqlQuery="SELECT DISTINCT TOP(200) Physical_id,LATITUDE,LONGITUDE FROM [KPI_Gids].[gid].[Cell_GIS] order by LATITUDE ASC,LONGITUDE ASC"
# # #             sqlQuery="""
# # # DECLARE @centerLatitude FLOAT = {lat};
# # # DECLARE @centerLongitude FLOAT =  {long};
# # # DECLARE @radius FLOAT = {radius};

# # # SELECT DISTINCT 
# # #     Latitude, 
# # #     Longitude
# # # FROM gid.Cell_GIS
# # # WHERE 
# # # 	6371 * 2 * 
# # # 	ASIN(SQRT(POWER(SIN(RADIANS(Latitude - @centerLatitude) / 2), 2) + 
# # # 	COS(RADIANS(@centerLatitude)) * COS(RADIANS(Latitude)) * 
# # # 	POWER(SIN(RADIANS(Longitude - @centerLongitude) / 2), 2))) <= @radius;

# # # """.format(lat=argu["lat"],long=argu["lng"],radius=radian[argu["radius"]])
            

# #             print(sqlQuery,"sqlQuerysqlQuery")
            
            
# #             data=cso.findFromDifferentServer(sql_conn_obj,sqlQuery)["data"]


# #             print(data)

# #             allGrouped=data.groupby(['LATITUDE', 'LONGITUDE'])

# #             marker_data=data
#             # from geopy.distance import geodesic

#             # # Assuming your dataframe is named 'df' and has 'latitude' and 'longitude' columns

#             # # Example dataframe
#             # # data = {'latitude': [34.0522, 40.7128, 41.8781, 37.7749],
#             # #         'longitude': [-118.2437, -74.0060, -87.6298, -122.4194]}
#             # df = data
#             # # Function to calculate distance between two points
#             # def calculate_distance(point1, point2):
#             #     return geodesic(point1, point2).km

#             # # Initialize an empty list to store unique marker locations
#             # unique_marker_locations = []

#             # # Iterate over the dataframe rows
#             # for index, row in df.iterrows():
#             #     current_location = (row['LATITUDE'], row['LONGITUDE'])
                
#             #     # Check if the current location is at least 10 km away from all previous unique locations
#             #     is_unique_location = all(calculate_distance(current_location, marker_location) >= 10
#             #                             for marker_location in unique_marker_locations)
                
#             #     # If the current location is unique, add it to the list
#             #     if is_unique_location:
#             #         unique_marker_locations.append(list(current_location))

#             # # Print the unique marker locations
#             # print(unique_marker_locations)
#             # final_groups={}
#             # for i in unique_marker_locations:
#             #     final_groups[str(i[0])+"_"+str(i[1])]=i
            
        
#             # return {"data":final_groups,"type":"S"}
#         else:


            
#             sqlQuery="""SELECT TOP 10 DISTINCT T1.LATITUDE AS LATITUDE, T1.LONGITUDE AS LONGITUDE FROM gid.Cell_GIS AS T1;"""
# #             sqlQuery="""DECLARE @geofenceLatitude FLOAT = {lat};
# # DECLARE @geofenceLongitude FLOAT = {long};
# # DECLARE @geofenceRadius FLOAT = {radius};
# # SELECT * FROM (SELECT DISTINCT T1.LATITUDE AS LATITUDE,T1.LONGITUDE AS LONGITUDE, 
# # CASE WHEN ABS(LATITUDE - @geofenceLatitude) <= @geofenceRadius AND ABS(LONGITUDE - @geofenceLongitude) <= @geofenceRadius THEN 'Inside' ELSE 'Outside' END AS GeofenceStatus 
# # FROM gid.Cell_GIS AS T1 INNER JOIN dbo.arc_setting_demo T2 on T1.Technology=T2.Technology AND T1.BAND=T2.BAND {filer}) as DATA where GeofenceStatus = 'Inside'
# # """.format(lat=argu["lat"],long=argu["lng"],radius=radian[argu["radius"]],filer=" WHERE "+filer if filer!="" else "")

            
#             data=cso.findFromDifferentServer(sql_conn_obj,sqlQuery)["data"]

#             print(data)
#             allGrouped=data.groupby(['LATITUDE', 'LONGITUDE'])

#             final_groups={}
#             for i in allGrouped:
#                 final_groups[str(i[0][0])+"_"+str(i[0][1])]=cfc.dfjson(i[1])
#             # print(sqlQuery)


            
#             # data['RESULT'] = data.apply(performOps,args=(kmdiff[argu["radius"]],), axis=1)
#             # data=data[data['RESULT'].isna()!=True]
#             # print(data,"data")
#             # final_groups={}
#             # final_groups = dict(data.apply(process_row, axis=1).tolist())
#             print(len(final_groups),len(data))
#             b=time.time()
#             print(b-a)
#             return {"data":final_groups,"type":"S"}




#         # Cell_Name like '%_nw%' AND 
#         #   WHERE T1.Site_Name LIKE '%15227%'
#         # sqlQuery = """SELECT TOP 1000 T1.Cell_name,T1.BAND,T1.Azimuth,T1.LATITUDE,T1.LONGITUDE,T1.Technology,T2.length,T2.orderRing,T2.beamWidth,T2.color FROM gid.Cell_GIS AS T1 INNER JOIN dbo.arc_setting_demo T2 on T1.Technology=T2.Technology AND T1.BAND=T2.BAND AND Cell_name like '%15227%';""" 


#         # final_groups = (data.groupby(['LATITUDE', 'LONGITUDE']).apply(lambda group: cfc.dfjson(group)).to_dict())

#         # print(final_groups)
            

#         # for i in final_groups:
#         #     print(i)
            

#         # print(allGrouped)
#         # data.
#     #     return {"data":final_groups,"type":"U"}
#     # else: