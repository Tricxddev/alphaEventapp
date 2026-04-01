


const landingFtPagination = (req)=>{
    const limit=parseInt(req.query.limit) || 4

    return{limit}
}


const landingtrdPagination = (req)=>{
    const limit=parseInt(req.query.limit) || 3

    return{limit}
}
module.exports={landingtrdPagination,landingFtPagination}