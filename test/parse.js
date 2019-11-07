/* global console */
var test = require('tape');
var HTML = require('../index');


test('parse', function (t) {
    var html = '<div class="oh"><p></p></div>';
    var parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {
            class: 'oh'
        },
        voidElement: false,
        children: [
            {
                type: 'tag',
                name: 'p',
                attrs: {},
                children: [],
                voidElement: false
            }
        ]
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<div class="oh"><p>hi</p></div>';
    parsed = HTML.parse(html);

    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {
            class: 'oh'
        },
        voidElement: false,
        children: [
            {
                type: 'tag',
                name: 'p',
                attrs: {},
                voidElement: false,
                children: [
                    {
                        type: 'text',
                        content: 'hi'
                    }
                ]
            }
        ]
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<!-- just a comment node -->';
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
      type: 'comment',
      comment: ' just a comment node '
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<div><h2>Comment below this header</h2><!-- just a comment node --></div>';
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        name: 'div',
        type: 'tag',
        attrs: {},
        voidElement: false,
        children: [{
            attrs: {},
            name: 'h2',
            type: 'tag',
            voidElement: false,
            children: [{
                content: 'Comment below this header',
                type: 'text'
            }]
        },
        {
            type: 'comment' ,
            comment: ' just a comment node ',
        }]
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<div><h2>Comment below this header</h2><!-- just a comment node --><!-- subsequent comment node --></div>';
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        name: 'div',
        type: 'tag',
        attrs: {},
        voidElement: false,
        children: [{
            attrs: {},
            name: 'h2',
            type: 'tag',
            voidElement: false,
            children: [{
                content: 'Comment below this header',
                type: 'text'
            }]
        },
        {
            type: 'comment' ,
            comment: ' just a comment node ',
        },{
            type: 'comment',
            comment: ' subsequent comment node '
        }]
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<div><h2><!-- comment inside h2 tag --></h2></div>';
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        name: 'div',
        type: 'tag',
        attrs: {},
        voidElement: false,
        children: [{
            attrs: {},
            name: 'h2',
            type: 'tag',
            voidElement: false,
            children: [{
                type: 'comment' ,
                comment: ' comment inside h2 tag ',
            }]
        }]
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<!---->'
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
      type: 'comment',
      comment: ''
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<!---this comment starts with a hyphen b/c web developers love curveballs -->'
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
      type: 'comment',
      comment: '-this comment starts with a hyphen b/c web developers love curveballs '
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<div>oh <strong>hello</strong> there! How are <span>you</span>?</div>';
    parsed = HTML.parse(html);

    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {},
        voidElement: false,
        children: [
            {
                type: 'text',
                content: 'oh '
            },
            {
                type: 'tag',
                name: 'strong',
                attrs: {},
                voidElement: false,
                children: [
                    {
                        type: 'text',
                        content: 'hello'
                    }
                ]
            },
            {
                type: 'text',
                content: ' there! How are '
            },
            {
                type: 'tag',
                name: 'span',
                attrs: {},
                voidElement: false,
                children: [
                    {
                        type: 'text',
                        content: 'you'
                    }
                ]
            },
            {
                type: 'text',
                content: '?'
            }
        ]
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<div class="handles multiple classes" and="attributes"></div>';
    parsed = HTML.parse(html);

    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {
            class: 'handles multiple classes',
            and: 'attributes'
        },
        voidElement: false,
        children: []
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<div class=\'handles\' other=47 and="attributes"></div>';
    parsed = HTML.parse(html);

    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {
            class: 'handles',
            other: '47',
            and: 'attributes'
        },
        voidElement: false,
        children: []
    }]);
    t.equal(HTML.stringify(parsed), '<div class="handles" other="47" and="attributes"></div>');

    html = '<div-custom class="oh"><my-component some="thing"><p>should be ignored</p></my-component></div-custom>';
    parsed = HTML.parse(html, {
        components: {
            'my-component': 'something'
        }
    });

    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div-custom',
        attrs: {
            class: 'oh'
        },
        voidElement: false,
        children: [
            {
                type: 'component',
                name: 'my-component',
                attrs: {
                    some: 'thing'
                },
                voidElement: false,
                children: []
            }
        ]
    }], 'should not include children of registered components in AST');

    html = '<div><my-component thing="one">ok</my-component><my-component thing="two">ok</my-component></div>';
    parsed = HTML.parse(html, {
        components: {
            'my-component': 'something'
        }
    });

    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {},
        voidElement: false,
        children: [
            {
                type: 'component',
                name: 'my-component',
                attrs: {
                    thing: 'one'
                },
                voidElement: false,
                children: []
            },
            {
                type: 'component',
                name: 'my-component',
                attrs: {
                    thing: 'two'
                },
                voidElement: false,
                children: []
            }
        ]
    }]);

    html = '<div><img></div>';
    parsed = HTML.parse(html);

    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {},
        voidElement: false,
        children: [
            {
                type: 'tag',
                name: 'img',
                attrs: {},
                voidElement: true,
                children: []
            }
        ]
    }], 'should handle unclosed void elements');
    t.equal(HTML.stringify(parsed), '<div><img/></div>');

    html = '<!DOCTYPE html>';
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        attrs: { html: null },
        children: [],
        name: '!DOCTYPE',
        type: 'tag',
        voidElement: true
    }], 'should handle attrs without values');
    t.equal(HTML.stringify(parsed), html);

    var html = '<input class="oh" disabled/>';
    var parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'input',
        attrs: {
            class: 'oh',
            disabled: null
        },
        voidElement: true,
        children: []
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<div></div><img>';
    parsed = HTML.parse(html);

    t.deepEqual(parsed, [
        {
            type: 'tag',
            name: 'div',
            attrs: {},
            voidElement: false,
            children: []
        },
        {
            type: 'tag',
            name: 'img',
            attrs: {},
            voidElement: true,
            children: []
        }
    ], 'should handle multiple root nodes');
    t.equal(HTML.stringify(parsed), '<div></div><img/>');

    html = '<div><void-web-component/></div>';
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {},
        voidElement: false,
        children: [
            {
                type: 'tag',
                name: 'void-web-component',
                attrs: {},
                voidElement: true,
                children: []
            }
        ]
    }], 'should handle custom void tags if self-closing');

    html = '<div><void-registered-component/></div>';
    parsed = HTML.parse(html, {components: {'void-registered-component': true}});
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {},
        voidElement: false,
        children: [
            {
                type: 'component',
                name: 'void-registered-component',
                attrs: {},
                voidElement: true,
                children: []
            }
        ]
    }], 'should handle registered void tags if self-closing');


    html = '<div> 9 <input type="text"/> 10 </div>';
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {},
        voidElement: false,
        children: [
            { type: 'text', content: ' 9 ' },
            {
                type: 'tag',
                name: 'input',
                attrs: {
                    type: 'text'
                },
                children: [],
                voidElement: true,
            },
            { type: 'text', content: ' 10 ' },
        ]
    }], 'should not give voidElements children');

    html = '<div></div>\n';
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {},
        voidElement: false,
        children: []
    }], 'should not explode on trailing whitespace');

    html = '<div>Hi</div> There ';
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {},
        voidElement: false,
        children: [
            { type: 'text', content: 'Hi' }
        ]
    },{
        type: 'text', content: ' There '
    }], 'should handle trailing text nodes at the top-level');

    html = '<div>Hi</div> There <span>something</span> <a></a>else ';
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {},
        voidElement: false,
        children: [
            { type: 'text', content: 'Hi' }
        ]
    },{
        type: 'text', content: ' There '
    },{
        type: 'tag',
        name: 'span',
        attrs: {},
        voidElement: false,
        children: [
            { type: 'text', content: 'something' }
        ]
    },{
        type: 'tag',
        name: 'a',
        attrs: {},
        voidElement: false,
        children: []
    },{
        type: 'text', content: 'else '
    }], 'should handle text nodes in the middle of tags at the top-level');

    // simple path
    html = `<svg height="210" width="400"><path d="M150 0 L75 200 L225 200 Z"/></svg>`
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'svg',
        attrs: {
            height: '210',
            width: '400'
        },
        voidElement: false,
        children: [
            {
                type: 'tag',
                name: 'path',
                attrs: {
                    d: 'M150 0 L75 200 L225 200 Z',
                },
                children: [],
                voidElement: true
            }
        ]
    }]);
    t.equal(html, HTML.stringify(parsed));

    // path with newlines
    html = `<svg height="210" width="400">
    <path class="st0" d="M60.56,147.78v-0.75c0-1.15-0.93-2.08-2.08-2.08H56.6c-1.15,0-2.08,0.93-2.08,2.08v0.75
			c-1.49,0.99-2.44,2.69-2.44,4.54c0,3.01,2.45,5.45,5.45,5.45c3.01,0,5.45-2.45,5.45-5.45C63,150.47,62.05,148.77,60.56,147.78z
			 M56.24,152.32c0-0.57,0.38-1.08,0.94-1.24c0.13-0.04,0.25-0.08,0.36-0.14c0.11,0.06,0.24,0.11,0.36,0.14
			c0.55,0.16,0.94,0.67,0.94,1.24c0,0.72-0.58,1.3-1.3,1.3S56.24,153.03,56.24,152.32z"></path></svg>`;
    html = `<svg height="210" width="400">
    <path class="st0" d="M150 0 L75 200 L225 200 Z
    M150 0 L75 200 L225 200 Z
    M150 0 L75 200 L225 200 Z"></path></svg>`;
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'svg',
        attrs: {
            height: '210',
            width: '400'
        },
        voidElement: false,
        children: [
            { content: '\n    ', type: 'text' },
            {
                type: 'tag',
                name: 'path',
                attrs: {
                    class: 'st0',
                    d: 'M150 0 L75 200 L225 200 Z\n    M150 0 L75 200 L225 200 Z\n    M150 0 L75 200 L225 200 Z',
                },
                children: [],
                voidElement: false
            }
        ]
    }]);
    t.equal(html, HTML.stringify(parsed));

    html = '<div>Hi</div>\n\n <span>There</span> \t ';
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'div',
        attrs: {},
        voidElement: false,
        children: [
            { type: 'text', content: 'Hi' }
        ]
    },{
        type: 'tag',
        name: 'span',
        attrs: {},
        voidElement: false,
        children: [
            { type: 'text', content: 'There' }
        ]
    }], 'should remove text nodes that are nothing but whitespace');

    html = `<script>
      !function() {
        var cookies = document.cookie ? document.cookie.split(';') : [];
        //                |   this less than is triggering probems
        for (var i = 0; i < cookies.length; i++) {
          var splitted = cookies[i].split('=');
          var name = splitted[0];
        }
      }();
      </script>`
    parsed = HTML.parse(html);
    t.deepEqual(parsed, [{
        type: 'tag',
        name: 'script',
        attrs: {},
        voidElement: false,children: [ { content: '\n      !function() {\n        var cookies = document.cookie ? document.cookie.split(\';\') : [];\n        //                |   this less than is triggering probems\n        for (var i = 0; i ', type: 'text' } ]
    }], 'should parse a script tag');

    t.end();
});

test('simple speed sanity check', function (t) {
    var i = 100000;
    var groupSize = 1000;
    var waitLoopSize = 10000000;
    var groups = i / groupSize;
    var html = '<html><head><title>Some page</title></head><body class="hey there"><img src="someURL"><h3>Hey, we need content</h3><br></body></html>';

    var parse = HTML.parse;
    var times = [];
    var count;
    var waitCount;
    var total = 0;
    var start, stepAverage;

    console.log('running ' + i + ' iterations...');

    while(i--) {
        count = groupSize;
        // grab groups
        if (i % count === 0) {
            start = Date.now();
            while(count--) {
                parse(html);
            }
            var diff = Date.now() - start;
            stepAverage = diff/groupSize;
            console.log('group '  + (groups - (i / groupSize)) + ': ' + stepAverage);
            times.push(stepAverage);
            total += stepAverage;
            waitCount = waitLoopSize;
            // forcing a bit of a pause between tests
            while(waitCount--) {}
        }

    }

    // trim off first
    // it's always a slower outlier
    // with higher variability that
    // makes it harder to find differences
    times.shift();

    var max = Math.max.apply(null, times);
    var min = Math.min.apply(null, times);
    var average = total / times.length;

    console.log('max', max);
    console.log('min', min);
    console.log('avg', average);

    t.end();
});
