!(function(a) {
  var e,
    d =
      '<svg><symbol id="icon-dakaisanshu" viewBox="0 0 1024 1024"><path d="M203.009 859.615c-21.321 0-38.623-20.085-38.623-43.49v-608.248c0-23.947 17.921-43.49 38.623-43.49 21.321 0 38.623 20.085 38.623 43.49v608.248c0 23.947-17.921 43.49-38.623 43.49zM512 859.615c-21.321 0-38.623-20.085-38.623-43.49v-608.248c0-23.947 17.921-43.49 38.623-43.49 21.321 0 38.623 20.085 38.623 43.49v608.248c0 23.947-17.921 43.49-38.623 43.49zM820.991 859.615c-21.321 0-38.623-20.085-38.623-43.49v-608.248c0-23.947 17.921-43.49 38.623-43.49 21.321 0 38.623 20.085 38.623 43.49v608.248c0 23.947-17.921 43.49-38.623 43.49z" fill="#4A4A4A" ></path></symbol></svg>',
    t = (e = document.getElementsByTagName("script"))[e.length - 1].getAttribute("data-injectcss");
  if (t && !a.__iconfont__svg__cssinject__) {
    a.__iconfont__svg__cssinject__ = !0;
    try {
      document.write(
        "<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>",
      );
    } catch (e) {
      console && console.log(e);
    }
  }
  !(function(e) {
    if (document.addEventListener)
      if (~["complete", "loaded", "interactive"].indexOf(document.readyState)) setTimeout(e, 0);
      else {
        var t = function() {
          document.removeEventListener("DOMContentLoaded", t, !1), e();
        };
        document.addEventListener("DOMContentLoaded", t, !1);
      }
    else
      document.attachEvent &&
        ((n = e),
        (o = a.document),
        (i = !1),
        (c = function() {
          i || ((i = !0), n());
        }),
        (d = function() {
          try {
            o.documentElement.doScroll("left");
          } catch (e) {
            return void setTimeout(d, 50);
          }
          c();
        })(),
        (o.onreadystatechange = function() {
          "complete" === o.readyState && ((o.onreadystatechange = null), c());
        }));
    var n, o, i, c, d;
  })(function() {
    var e, t, n, o, i, c;
    ((e = document.createElement("div")).innerHTML = d),
      (d = null),
      (t = e.getElementsByTagName("svg")[0]) &&
        (t.setAttribute("aria-hidden", "true"),
        (t.style.position = "absolute"),
        (t.style.width = 0),
        (t.style.height = 0),
        (t.style.overflow = "hidden"),
        (n = t),
        (o = document.body).firstChild
          ? ((i = n), (c = o.firstChild).parentNode.insertBefore(i, c))
          : o.appendChild(n));
  });
})(window);
