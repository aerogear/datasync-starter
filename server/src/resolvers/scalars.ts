import {
    DateTimeResolver,
    JSONResolver,
    ObjectIDResolver
} from 'graphql-scalars';

export default {
    ObjectID: ObjectIDResolver,
    DateTime: DateTimeResolver,
    JSON: JSONResolver
}