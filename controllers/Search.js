const SearchModel = require("../models/Search");

exports.getSearch = async (req, res, next) => {
  const search = await SearchModel.find();
  res.status(200).json({ sucess: true, search });
};

exports.createSearch = async (req, res, next) => {
  let body = req.body;

  const search = await SearchModel.create(body);
  res.status(200).json({ sucess: true, search });
};
