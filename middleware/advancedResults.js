let advancedResults = (model, populate) => async (req, res, next) => {

  let query;

  let reqQuery = {...req.query};

  let removeFields = ['select', 'sort', 'page', 'limit'];

  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  //url?averageCost[gte]=1000&location=boston or same like queries
  //url?careers[in]=Business
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/, match => `$${match}`);

  query = model.find(JSON.parse(queryStr));

  if(req.query.select){
    let fields = req.query.select.split(',').join(' ');
    query.select(fields);
  }

  if(req.query.sort){
    let sortBy = req.query.sort.split(',').join(' ');    
    query = query.sort(sortBy);
  }else{
    query = query.sort('-createdAt');
  }

  let page = +req.query.page || 1;
  let limit = +req.query.limit || 25;
  let startIndex = (page - 1) * limit;
  let endIndex = page * limit;
  let total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if(populate){
    query = query.populate(populate);
  }

  const results = await query;

  let pagination = {};

  if(endIndex < total){
    pagination.next = {
    page: page + 1,
    limit
    }
  }

  if(startIndex > 0){
    pagination.prev = {
    page: page - 1,
    limit
    }
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  }

  next();
} 

module.exports = advancedResults;