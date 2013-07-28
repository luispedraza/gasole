// thanks to Alex Tatiyants!
// http://tatiyants.com/how-to-get-ie8-to-support-html5-tags-and-web-fonts/
document.createElement('header');
document.createElement('nav');
document.createElement('section');
document.createElement('article');
document.createElement('aside');
document.createElement('footer');

// thanks to Eli Grey!
// http://eligrey.com/blog/post/textcontent-in-ie8
if (Object.defineProperty && Object.getOwnPropertyDescriptor &&
     Object.getOwnPropertyDescriptor(Element.prototype, "textContent") &&
    !Object.getOwnPropertyDescriptor(Element.prototype, "textContent").get)
  (function() {
    var innerText = Object.getOwnPropertyDescriptor(Element.prototype, "innerText");
    Object.defineProperty(Element.prototype, "textContent",
      { // It won't work if you just drop in innerText.get
        // and innerText.set or the whole descriptor.
        get : function() {
          return innerText.get.call(this)
        },
        set : function(x) {
          return innerText.set.call(this, x)
        }
      }
    );
  })();