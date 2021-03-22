var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");

var template = {
  HTML: function (title, list, body, control) {
    return `
          <!doctype html>
          <html>
          <head>
          <title>WEB1 - ${title}</title>
          <meta charset="utf-8">
          </head>
          <body>
          <h1><a href="/">WEB</a></h1>
          ${list}
          ${control}
          ${body}
          </body>
          </html>
        `;
  },
  list: function (filelist) {
    var list = "<ul>";

    var i = 0;
    while (i < filelist.length) {
      list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
      i = i + 1;
    }
    list = list + "</ul>";
    return list;
  },
};

var app = http.createServer(function (request, response) {
  var _url = request.url;
  // console.log(_url); // 결과 : /?id=HTML
  // var queryData = url.parse(_url, true).query;

  var myURL = new URL(`http://localhost:3000${_url}`);
  // 생활코딩에서 queryData.id와 같은 기능
  var title = myURL.searchParams.get("id");
  // console.log(title); // 결과 : HTML

  if (myURL.pathname === "/") {
    if (title === null) {
      fs.readdir("./data", (error, filelist) => {
        var title = "Welcome";
        var description = "Hello Node.js";
        var list = template.list(filelist);

        var html = template.HTML(r
          title,
          list,
          `<h2>${title}</h2>${description}`,
          `<a href="/create">create<a/>`
        );
        response.writeHead(200);
        response.end(html);
      });
    } else {
      fs.readdir("./data", (error, filelist) => {
        fs.readFile(`data/${title}`, "utf8", (err, description) => {
          var list = template.list(filelist);
          var html = template.HTML(
            title,
            list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create<a/>
             <a href="/update?id=${title}">update<a/>
             <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <input type="submit" value="delete">
                </form>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if (myURL.pathname === "/create") {
    fs.readdir("./data", (error, filelist) => {
      var title = "Web - Create";
      var description = "Hello Node.js by Koi";
      var list = template.list(filelist);

      var html = template.HTML(
        title,
        list,
        `<form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>`,
        ""
      );
      response.writeHead(200);
      response.end(html);
    });
  } else if (myURL.pathname === "/create_process") {
    var body = "";
    request.on("data", (data) => {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body); // 들어온 정보를 객체화.
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, "utf8", (err) => {
        response.writeHead(302, { Location: `/?id=${title}` }); // 사용자를 이 페이지로 보내버림.
        response.end();
      });
    });
  } else if (myURL.pathname === "/update") {
    fs.readdir("./data", (error, filelist) => {
      fs.readFile(`data/${title}`, "utf8", (err, description) => {
        var list = template.list(filelist);
        var html = template.HTML(
          title,
          list,
          `<form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>`,
          `<a href="/create">create<a/> <a href="/update?id=${title}">update<a/>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (myURL.pathname === "/update_process") {
    var body = "";
    request.on("data", (data) => {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body); // 들어온 정보를 객체화.
      console.log(post);

      var id = post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, (error) => {
        fs.writeFile(`data/${title}`, description, "utf8", (err) => {
          response.writeHead(302, { Location: `/?id=${title}` }); // 사용자를 이 페이지로 보내버림.
          response.end();
        });
      });
    });
  } else if (myURL.pathname === "/delete_process") {
    var body = "";
    request.on("data", (data) => {
      body = body + data;
    });
    request.on("end", function () {
      var post = qs.parse(body); // 들어온 정보를 객체화.
      var id = post.id;
      fs.unlink(`data/${id}`, (err) => {
        response.writeHead(302, { Location: "/" }); // 사용자를 이 페이지로 보내버림.
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("404 Not Found");
  }
});
app.listen(3000);