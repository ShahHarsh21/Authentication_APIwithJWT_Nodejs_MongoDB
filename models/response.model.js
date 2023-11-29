class responseModel {
    static success = (statusCode,message,data)=>{
        let res = {
            statusCode : statusCode,
            message : message,
            data: data || []
        }
        return res
    }
    
    static error = (statusCode,message,error)=>{
        let res = {
            statusCode : statusCode,
            message : message,
            error: error
        }
        return res
    }
}

export default responseModel