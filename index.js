const express = require("express");
const cors = require("cors");
const { store } = require("./data_access/store");

const application = express();
const port = process.env.PORT || 4002;

//middlewares
application.use(express.json());
application.use(cors());


//methods
application.get("/", (request, response) => {
  response
    .status(200)
    .json({ done: true, message: "Welcome to image quiz backend API!" });
});


application.post("/register", (request, response) => {
  let name = request.body.name;
  let email = request.body.email;
  let password = request.body.password;
  
  store.findCustomer(email)
  .then((resp) => {
    if (resp.found){
      response
      .status(400)
      .json({ done: false, message: "The customer " + email + " existed. Please log in." });
    }else{
      store.addCustomer(name, email, password)
      .then((resp) => {
        if (resp.valid){
          response
          .status(200)
          .json({ done: true, message: "The customer " + email + " registered successfully!" });
        }else{
          response
          .status(500)
          .json({ done: false, message:  "Could not register user " + email + " due to an error." });
        }
      })
    }
  })
  .catch(e => {
    response.status(500).json({ done: false, message: "Could not register user " + email + " due to an error." });
  });
});

application.post("/login", (request, response) => {
  let email = request.body.email;
  let password = request.body.password;

  store.login(email, password)
  .then((resp) => {
    console.log(resp);
    if (resp.valid){
      response
      .status(200)
      .json({ done: true, message: "The customer " + email + " logged in successfully!" });
    }else{
      response
      .status(401)
      .json({ done: false, message: resp.message });
    }
  })
  .catch(e => {
    response.status(500).json({ done: false, message: "Could not log user " + email + " in due to an error." });
  });
});

application.get("/quiz/:name", (request, response) => {
  let name = request.params.name;
  store.getQuiz(name)
  .then(x => {
    if (x.id){
      response.status(200).json({ done: true, result: x });
    }else{
      response.status(404).json({ done: false, message: "Cannot find quiz " + name });
    }
  })
  .catch(e => {
    console.log(e);
    response.status(500).json({ done: false, message: 'Something went wrong.' });
  });
});


application.get("/flowers", (request, response) => {
  store.getFlower()
  .then(x => {
    console.log(x);
    if (x.found){
      response.status(200).json({done: true, result: x.res, message: x.len + " flowers found."});
    }else{
      response.status(404).json({done: false, result: x.res, message: "0 flower found."});
    }
  })
  .catch(e => {
    response.status(404).json({done: false, result: [], message: "Cannot retrieve the flower list due to an error."});
  })
});


application.get("/scores/:quiztaker/:quizname", (request, response) => {
  let quizTaker = request.params.quiztaker;
  let quizName = request.params.quizname;

  store.getScores(quizTaker, quizName)
  .then(x => {
    console.log(x);
    if (x.found){
      response.status(200).json({done: true, result: x.res, message: x.len + " scores found."});
    }else{
      response.status(404).json({done: false, result: x.res, message: "0 score found."});
    }
  })
  .catch(e => {
    response.status(404).json({done: false, result: [], message: "Cannot retrieve " + quizTaker + " result in quiz " + quizName + " due to an error."});
  })
});


application.post("/score", (request, response) => {
  let quizTaker = request.body.quizTaker;
  let quizName = request.body.quizName;
  let score = request.body.score;
  let date = new Date().toISOString().slice(0, 10);

  store.findCustomer(quizTaker)
  .then((resp) => {
    console.log(resp.found == false);
    if (resp.found == false){
      response
      .status(400)
      .json({ done: false, message: "The quizTaker " + quizTaker + " is not found." });
    }else{
      const taker_id = resp.id;
      store.findQuiz(quizName)
      .then((resp) => {
        if (resp.found){
          const quiz_id = resp.id;
          store.score(taker_id, quiz_id, score, date)
          .then((resp) => {
            if (resp.valid){
              response
              .status(200)
              .json({ done: true, message: "The score " + score + " of user " + quizTaker + " for quiz " + quizName + " on " + date + " was added successfully!" });
            }else{
              response
              .status(500)
              response.status(500).json({ done: false, message: "Could not add the requested score." });
            }
          })
          .catch(e => {
            response.status(500).json({ done: false, message: "Could not add the requested score." });
          });

        }else{
          response
          .status(400)
          .json({ done: false, message:"The quiz " + quizName + " is not found." });
        }
      })
    }
  })
  .catch(e => {
    response.status(500).json({ done: false, message: "Could not add the requested score." });
  });
});

application.listen(port, () => {
  console.log(`Listening to the port ${port} `);
});
