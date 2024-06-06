```javascript
let data = {
    // TODO: insert your data structure that contains 
    // users + quizzes here
    users: [{
        email: 'zhihaobalabala@unsw.edu.au',
        password: 'hduiqhdiuqw', 
        nameFirst: 'Zhihao', 
        nameLast: 'Cao',
        UserId: 1, 
        numSuccessfulLogins: 10,
        numFailedPasswordsSinceLastLogin: 999999,
        averageRank: 0.25,
        attendedListId: [1, 28, 35],
        quizAccuracy: 0.90,
    }, {
        email: 'fahuiefhaiuwe@unsw.edu.au',
        password: 'hduiqhdiuqw', 
        nameFirst: 'Bernard', 
        nameLast: 'McGill',
        UserId: 2, 
        numSuccessfulLogins: 14,
        numFailedPasswordsSinceLastLogin: 0,
        averageRank: 0.38,
        attendedListId: [1, 28, 35],
        quizAccuracy: 0.88,
    }], 

    quizLists: [{course: "COMP1531",
        listNumber: 1,
        quizzes: [{
            quizId: 1,
            name: 'Week 1 tutes quiz1',
            timeCreated: 1683125870,
            timeLastEdited: 1683125871,
            description: 'COMP1531 week1 tutes quiz...',
            quizOptions: [{A:.., B:..., C:..., D:..}],
            answer: 'A',
            points: 10,
        }, {
            quizId: 2,
            name: 'Week 2 tutes quiz2',
            timeCreated: 1683125870,
            timeLastEdited: 1683125871,
            description: 'COMP1531 week1 tutes quiz...',
            quizOptions: [{A:.., B:..., C:..., D:..}],
            answer: 'C',
            points: 15,
        }]
    },
    // other course
    ]
}
```

[Optional] short description: 
// for users, its just an array of objects which store a bunch of personal details for users
// for quizLists, it is an array of objects, each object has 3 property, course, listNumber and quzzies
// which is also an array of objects, which contain all details for 1 quiz like, answer and points.
