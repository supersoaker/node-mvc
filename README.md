node-mvc
========

2-way binding and App.Model testing <br>
http://supersoaker.github.io/node-mvc/blog.html

Completely build with these lines of code:
```javascript
$(document).ready(function() {

    var blub = new App.Model( "post", {
        head: 'title',
        content: 'hallo welt'
    } );

    $('button').click( function () {
        var newPost = new App.Model( "post", {
            head    : $('input')[0].value,
            content : $('input')[1].value
        } );
        $('#post-wrapper').append( newPost.get('viewElem') );
    });
});
```
