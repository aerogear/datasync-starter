export const models = [
  {
    name: "Task",
    pubSub: {
      publishCreate: true,
      publishUpdate: true,
      publishDelete: true,
    },
  },
  {
    name: "Comment",
    pubSub: {
      publishCreate: true,
      publishUpdate: true,
      publishDelete: true,
    },
  },
]
