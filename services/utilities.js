


const landingFtPagination = (req)=>{
    const limit=parseInt(req.query.limit) || 3

    return{limit}
}
//module.exports=landingFtPagination

const landingtrdPagination = (req)=>{
    const limit=parseInt(req.query.limit) || 4

    return{limit}
}
module.exports={landingtrdPagination,landingFtPagination}