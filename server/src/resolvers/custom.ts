

/**
 * Custom resolvers for business logic that is not supported out of the box 
 * by Graphback.
 */
export default {
    Query: {
        getDraftTasks: () => {
            return [{
                _id: "fc1c09b33bfa7c447538550539a96d73",
                name: "draft task",
                description: "test",
            }]
        }
    }
}