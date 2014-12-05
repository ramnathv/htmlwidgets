# Convert data frames to JSON more flexibly
#
# The toJSON function in RJSONIO converts a dataframe to an object of
# arrays by column. Sometimes, we need an array of objects. This function
# provides more flexible options to convert a dataframe to JSON. It also
# allows one to return an R object which when passed to the toJSON function
# will return the desired JSON structure.
#
# examples:

# d <- data.frame(x = c(1, 2), y = c("a", "b"))
# to_json(d)                     # {"x":[1,2],"y":["a","b"]}
# to_json(d, orient = 'records') # [{"x":1,"y":"a"},{"x":2,"y":"b"}]
# to_json(d, orient = 'values')  # [[1,"a"],[2,"b"]]
to_json = function(df, orient = "columns", json = TRUE){
  dl = as.list(df)
  dl = switch(orient,
    columns = dl,
    records = do.call('zip_vectors_', dl),
    values = do.call('zip_vectors_', setNames(dl, NULL))
  )
  if (json){
    dl = RJSONIO::toJSON(dl, digits = 16)
  }
  return(dl)
}

zip_vectors_ = function(..., names = F){
  x = list(...)
  y = lapply(seq_along(x[[1]]), function(i) lapply(x, pluck_(i)))
  if (names) names(y) = seq_along(y)
  return(y)
}

pluck_ = function (element){
  function(x) x[[element]]
}

