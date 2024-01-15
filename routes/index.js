var express = require("express");
var router = express.Router();
const { protected } = require("../controllers/aunthentication");

var OAuthClient = require("intuit-oauth");
var QuickBooks = require("node-quickbooks");
const { createWriteStream, createReadStream } = require("fs");
const got = require("got");

/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.session.currentUser) {
    res.render("index", { title: "Express" });
  } else {
    res.render("login", {
      errorMessage: "Login required. Please login",
      successMessage: false,
    });
  }
});

router.get("/login", function (req, res, next) {
  if (req.session.currentUser) {
    res.redirect("/");
  } else {
    res.render("login", { errorMessage: false, successMessage: false });
  }
});

/**
 * Get the AuthorizeUri
 */
router.get("/authUri", function (req, res) {
  // Define AUTH client
  oauthClient = new OAuthClient({
    clientId: process.env.QBO_CLIENT_ID,
    clientSecret: process.env.QBO_CLIENT_SECRET_KEY,
    environment: process.env.QBO_ENV,
    redirectUri: process.env.QBO_REDIRECT_URI,
  });

  var authUri = oauthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting],
    state: "intuit-test",
  });

  res.redirect(authUri);
});

/**
 * Handle the callback to extract the `Auth Code` and exchange them for `Bearer-Tokens`
 */
router.get("/callback", function (req, res) {
  console.log(req.url);
  oauthClient
    .createToken(req.url)
    .then(function (authResponse) {
      res.redirect("/");
    })
    .catch(function (e) {
      console.error(e);
    });
});

router.get("/callback", function (req, res) {
  console.log(req.url);
  oauthClient
    .createToken(req.url)
    .then(function (authResponse) {
      res.redirect("/");
    })
    .catch(function (e) {
      console.error(e);
    });
});

/**
 * getCustomerInfo ()
 */
router.post("/get-customer-list", protected, async function (req, res) {
  const start = req.body.start;
  if (!oauthClient.isAccessTokenValid()) {
    oauthClient
      .refresh()
      .then(async function (authResponse) {
        console.log(authResponse);
        //Token has been refreshed
        var url =
          oauthClient.environment == "sandbox"
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;
        const companyID = oauthClient.getToken().realmId;
        let finalCustomerList = [];
        var get_all_customer = "SELECT COUNT(*) FROM CUSTOMER";
        const countResult = await oauthClient.makeApiCall({
          url:
            url +
            "v3/company/" +
            companyID +
            "/query?query=" +
            get_all_customer +
            "&minorversion=59",
        });
        let count = JSON.parse(countResult.text());
        const totalCustomers = count.QueryResponse.totalCount;
        let customerCount = 0;
        while (customerCount < totalCustomers) {
          var get_all_customer =
            "SELECT * FROM CUSTOMER STARTPOSITION " +
            customerCount +
            " MAXRESULTS 1000";
          const response = await oauthClient.makeApiCall({
            url:
              url +
              "v3/company/" +
              companyID +
              "/query?query=" +
              get_all_customer +
              "&minorversion=59",
          });
          let customerList = JSON.parse(response.text());
          finalCustomerList = [
            ...finalCustomerList,
            ...customerList.QueryResponse.Customer,
          ];
          customerCount += 1000;
        }
        res.send(finalCustomerList);
      })
      .catch(function (e) {
        // If error send to authentication
        res.redirect("/authUri");
      });
  } else {
    var url =
      oauthClient.environment == "sandbox"
        ? OAuthClient.environment.sandbox
        : OAuthClient.environment.production;
    const companyID = oauthClient.getToken().realmId;
    let finalCustomerList = [];
    var get_all_customer = "SELECT COUNT(*) FROM CUSTOMER";
    const countResult = await oauthClient.makeApiCall({
      url:
        url +
        "v3/company/" +
        companyID +
        "/query?query=" +
        get_all_customer +
        "&minorversion=59",
    });
    let count = JSON.parse(countResult.text());
    const totalCustomers = count.QueryResponse.totalCount;
    let customerCount = 0;
    while (customerCount < totalCustomers) {
      var get_all_customer =
        "SELECT * FROM CUSTOMER STARTPOSITION " +
        customerCount +
        " MAXRESULTS 1000";
      const response = await oauthClient.makeApiCall({
        url:
          url +
          "v3/company/" +
          companyID +
          "/query?query=" +
          get_all_customer +
          "&minorversion=59",
      });
      let customerList = JSON.parse(response.text());
      finalCustomerList = [
        ...finalCustomerList,
        ...customerList.QueryResponse.Customer,
      ];
      customerCount += 1000;
    }
    res.send(finalCustomerList);
  }
});

router.get("/get-customer-count", protected, function (req, res) {
  if (!oauthClient.isAccessTokenValid()) {
    oauthClient
      .refresh()
      .then(function (authResponse) {
        //Token has been refreshed
        const companyID = oauthClient.getToken().realmId;
        var get_all_customer = "SELECT COUNT(*) FROM CUSTOMER";
        var url =
          oauthClient.environment == "sandbox"
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

        oauthClient
          .makeApiCall({
            url:
              url +
              "v3/company/" +
              companyID +
              "/query?query=" +
              get_all_customer +
              "&minorversion=59",
          })
          .then(function (authResponse) {
            console.log(authResponse.text());
            res.send(JSON.parse(authResponse.text()));
          })
          .catch(function (e) {
            console.error(e);
          });
      })
      .catch(function (e) {
        // If error send to authentication
        res.redirect("/authUri");
      });
  } else {
    const companyID = oauthClient.getToken().realmId;
    var get_all_customer = "SELECT COUNT(*) FROM CUSTOMER";
    var url =
      oauthClient.environment == "sandbox"
        ? OAuthClient.environment.sandbox
        : OAuthClient.environment.production;

    oauthClient
      .makeApiCall({
        url:
          url +
          "v3/company/" +
          companyID +
          "/query?query=" +
          get_all_customer +
          "&minorversion=59",
      })
      .then(function (authResponse) {
        res.send(JSON.parse(authResponse.text()));
      })
      .catch(function (e) {
        console.error(e);
      });
  }
});

router.get("/check-qbo-connection", protected, function (req, res) {
  if (typeof oauthClient === "undefined") {
    res
      .status(200)
      .json({ success: false, message: "You are not connected to QBO." });
  } else {
    // if token is invalid.
    res
      .status(200)
      .json({ success: true, message: "You are connected to QBO." });
  }
});
/**
 * getProductInfo ()
 */
router.get("/get-product-list", protected, function (req, res) {
  if (!oauthClient.isAccessTokenValid()) {
    oauthClient
      .refresh()
      .then(function (authResponse) {
        //Token has been refreshed
        const companyID = oauthClient.getToken().realmId;
        var get_all_items = "SELECT * FROM Item MAXRESULTS 1000";
        var url =
          oauthClient.environment == "sandbox"
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

        oauthClient
          .makeApiCall({
            url:
              url +
              "v3/company/" +
              companyID +
              "/query?query=" +
              get_all_items +
              "&minorversion=59",
          })
          .then(function (authResponse) {
            res.send(JSON.parse(authResponse.text()));
          })
          .catch(function (e) {
            console.error(e);
          });
      })
      .catch(function (e) {
        // If error send to authentication
        res.redirect("/authUri");
      });
  } else {
    //Token has been refreshed
    const companyID = oauthClient.getToken().realmId;
    var get_all_items = "SELECT * FROM Item MAXRESULTS 1000";
    var url =
      oauthClient.environment == "sandbox"
        ? OAuthClient.environment.sandbox
        : OAuthClient.environment.production;

    oauthClient
      .makeApiCall({
        url:
          url +
          "v3/company/" +
          companyID +
          "/query?query=" +
          get_all_items +
          "&minorversion=59",
      })
      .then(function (authResponse) {
        res.send(JSON.parse(authResponse.text()));
      })
      .catch(function (e) {
        console.error(e);
      });
  }
});

router.get("/get-invoice-list", protected, function (req, res) {
  if (!oauthClient.isAccessTokenValid()) {
    oauthClient
      .refresh()
      .then(function (authResponse) {
        //Token has been refreshed
        const companyID = oauthClient.getToken().realmId;
        var get_all_items = "SELECT * FROM Invoice MAXRESULTS 20";
        var url =
          oauthClient.environment == "sandbox"
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

        oauthClient
          .makeApiCall({
            url:
              url +
              "v3/company/" +
              companyID +
              "/query?query=" +
              get_all_items +
              "&minorversion=59",
          })
          .then(function (authResponse) {
            res.send(JSON.parse(authResponse.text()));
          })
          .catch(function (e) {
            console.error(e);
          });
      })
      .catch(function (e) {
        // If error send to authentication
        res.redirect("/authUri");
      });
  } else {
    //Token has been refreshed
    const companyID = oauthClient.getToken().realmId;
    var get_all_items = "SELECT * FROM Invoice MAXRESULTS 20";
    var url =
      oauthClient.environment == "sandbox"
        ? OAuthClient.environment.sandbox
        : OAuthClient.environment.production;

    oauthClient
      .makeApiCall({
        url:
          url +
          "v3/company/" +
          companyID +
          "/query?query=" +
          get_all_items +
          "&minorversion=59",
      })
      .then(function (authResponse) {
        res.send(JSON.parse(authResponse.text()));
      })
      .catch(function (e) {
        console.error(e);
      });
  }
});

router.get("/get-tax-list", protected, function (req, res) {
  if (!oauthClient.isAccessTokenValid()) {
    oauthClient
      .refresh()
      .then(function (authResponse) {
        //Token has been refreshed
        const companyID = oauthClient.getToken().realmId;
        var get_all_items = "SELECT * FROM TaxCode MAXRESULTS 20";
        var url =
          oauthClient.environment == "sandbox"
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

        oauthClient
          .makeApiCall({
            url:
              url +
              "v3/company/" +
              companyID +
              "/query?query=" +
              get_all_items +
              "&minorversion=59",
          })
          .then(function (authResponse) {
            res.send(JSON.parse(authResponse.text()));
          })
          .catch(function (e) {
            console.error(e);
          });
      })
      .catch(function (e) {
        // If error send to authentication
        res.redirect("/authUri");
      });
  } else {
    //Token has been refreshed
    const companyID = oauthClient.getToken().realmId;
    var get_all_items = "SELECT * FROM TaxCode MAXRESULTS 20";
    var url =
      oauthClient.environment == "sandbox"
        ? OAuthClient.environment.sandbox
        : OAuthClient.environment.production;

    oauthClient
      .makeApiCall({
        url:
          url +
          "v3/company/" +
          companyID +
          "/query?query=" +
          get_all_items +
          "&minorversion=59",
      })
      .then(function (authResponse) {
        res.send(JSON.parse(authResponse.text()));
      })
      .catch(function (e) {
        console.error(e);
      });
  }
});

router.get("/get-class-list", protected, function (req, res) {
  if (!oauthClient.isAccessTokenValid()) {
    oauthClient
      .refresh()
      .then(function (authResponse) {
        //Token has been refreshed
        const companyID = oauthClient.getToken().realmId;
        var get_all_items = "SELECT * FROM Class MAXRESULTS 20";
        var url =
          oauthClient.environment == "sandbox"
            ? OAuthClient.environment.sandbox
            : OAuthClient.environment.production;

        oauthClient
          .makeApiCall({
            url:
              url +
              "v3/company/" +
              companyID +
              "/query?query=" +
              get_all_items +
              "&minorversion=59",
          })
          .then(function (authResponse) {
            res.send(JSON.parse(authResponse.text()));
          })
          .catch(function (e) {
            console.error(e);
          });
      })
      .catch(function (e) {
        // If error send to authentication
        res.redirect("/authUri");
      });
  } else {
    //Token has been refreshed
    const companyID = oauthClient.getToken().realmId;
    var get_all_items = "SELECT * FROM Class MAXRESULTS 20";
    var url =
      oauthClient.environment == "sandbox"
        ? OAuthClient.environment.sandbox
        : OAuthClient.environment.production;

    oauthClient
      .makeApiCall({
        url:
          url +
          "v3/company/" +
          companyID +
          "/query?query=" +
          get_all_items +
          "&minorversion=59",
      })
      .then(function (authResponse) {
        res.send(JSON.parse(authResponse.text()));
      })
      .catch(function (e) {
        console.error(e);
      });
  }
});

module.exports = router;
