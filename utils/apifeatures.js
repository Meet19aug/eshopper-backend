//Main Class For Enabling Filter, Searches in Our Website <1:30:00 time>
// For Getting All Product of Page 2, http://localhost:4000/api/v1/products/?page=2
// Here "page" is query & "2" is queryString. 
// http://localhost:4000/api/v1/products/?page=1&price[gt]=500&price[lt]=2200&category=Laptop&keyword=product001 
// keyword -> Name if product
class ApiFeatures {
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }
    //search product by name using keywork as query and value as string
    search(){
        const keyword = this.queryStr.keyword?{
            name:{
                $regex:this.queryStr.keyword,
                $options:"i", //case  insensitive
            }
        }:{};
        this.query = this.query.find({...keyword})
        return this;
    }

    filter(){
        // http://localhost:4000/api/v1/products/?page=2&price[lt]=2000
        // temparory creating copy of querystr
        const queryCopy = {...this.queryStr}
        //Remove some field dor category
        const removeFields = ["keyword","page","limit"];

        removeFields.forEach(key=>delete queryCopy[key]);

        // Filter for price & Rating
        // console.log(queryCopy);

        let queryStr = JSON.stringify(queryCopy);
        queryStr =  queryStr.replace(/\b(gt|gte|lt|lte)\b/g, key=> `$${key}`)
        this.query = this.query.find(JSON.parse(queryStr));

        // console.log(queryStr);

        return this;
    }

    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1; // 50 Product and each page has 10 product so first skip 0, second skip = 10

        const skip = resultPerPage*(currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);

        return this;

    }
}

module.exports = ApiFeatures;