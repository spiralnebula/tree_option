Tree Option
====

A select option in the shape of a tree, allowing for subgroups of subgroups to
search through in order to make your selection. Useful for complex option choices.


```javascript
tree_option.make({
    tree : {
        "text"  : String,
        "child" : [
            { 
                "text"  : String,
                "child" : []
            }
        ]
    },
    button : [
        String
    ],
    submit : function ( state ) {
        state => {
            in_context   : String,
            option_state : Object,
            state        : Object,
            event        : Object
        }
    }
})
```