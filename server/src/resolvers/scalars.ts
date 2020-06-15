import {
    DateTimeResolver,
    JSONResolver,
    ObjectIDResolver
} from 'graphql-scalars';


/** 
 * Default scalars that are supported by DataSync starter
*/
export default {
    ObjectID: ObjectIDResolver,
    DateTime: DateTimeResolver,
    JSON: JSONResolver
}