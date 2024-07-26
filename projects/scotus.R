library(pheatmap)
library(RJSONIO)
data = read.csv("SCDB_2023_01_justiceCentered_Citation.csv")
# TODO add in the legacy data:
# data_old = read.csv("SCDB_Legacy_07_justiceCentered_Citation.csv")


# $term gives the proper term
# $justiceName
# $vote

for (year in 1946:2022) {
  print(year)

  mydata = data[data$term == year, ]

  # First, find all Justices in this term, then create matrix.
  justiceIDs = c()
  justices = list(unique(as.character(mydata$justiceName)))[[1]]
  for (justice in justices) {
    justiceIDs[justice] = length(justiceIDs) + 1
  }

  K = length(justiceIDs)
  votemat = matrix(0, nrow = K, ncol = K)
  disagreemat = matrix(0, nrow = K, ncol = K)
  mycases = list(unique(mydata$caseId))[[1]]
  for (mycase in mycases) {
    # Simple version is $majority:
    #   did they vote in the majority -- this is 1 (dissent), 2 (majority), NA
    # This is a simplified version of $vote, which has more detail

    voterecords = mydata[mydata$caseId == mycase, ]
    for (i in 1:nrow(voterecords)) {
      j1idx = justiceIDs[as.character(voterecords$justiceName[i])]
      vote1 = voterecords$majority[i]
      if (is.na(vote1)) {
        next
      }
      # votemat[j1idx, j1idx] = 1 + votemat[j1idx, j1idx]
      for (j in i:nrow(voterecords)) {
        j2idx = justiceIDs[as.character(voterecords$justiceName[j])]
        vote2 = voterecords$majority[j]
        if (is.na(vote2)) {
          next
        }
        if (vote1 == vote2) {
          votemat[j1idx, j2idx] = 1 + votemat[j1idx, j2idx]
          votemat[j2idx, j1idx] = 1 + votemat[j2idx, j1idx]
        }
        else {
          disagreemat[j1idx, j2idx] = 1 + disagreemat[j1idx, j2idx]
          disagreemat[j2idx, j1idx] = 1 + disagreemat[j2idx, j1idx]
        }
      }
    }
  }

  justicesToRemove = c()
  for (i in 1:K) {
    if (votemat[i, i] == 0) {
      justicesToRemove = append(justicesToRemove, i)
    }
  }
  if (length(justicesToRemove) > 0) {
    print(justices[justicesToRemove])
    justices = justices[-justicesToRemove]
    votemat = votemat[-justicesToRemove, -justicesToRemove]
    disagreemat = disagreemat[-justicesToRemove, -justicesToRemove]
  }

  # # Learning to plot
  # plot.new()
  # res = svd(votemat)
  # x = res$u[, 1]
  # y = res$u[, 2]
  # plot(x, y)
  # text(x, y, justices)
  votemat = votemat - diag(diag(votemat)) / 2
  ph = pheatmap::pheatmap(votemat, treeheight_row = 0, treeheight_col = 0, labels_row = justices, labels_col = justices)

  percentmat = votemat / (votemat + disagreemat)
  percentph = pheatmap::pheatmap(percentmat, treeheight_row = 0, treeheight_col = 0, labels_row = justices, labels_col = justices)


  output = vector(mode = "list", length = 4)
  # get justices in heatmap order
  output[[1]] = justices[ph$tree_row$order]
  # get votemat in heatmap order
  output[[2]] = votemat[ph$tree_row$order, ph$tree_row$order]
  # get justices in heatmap order
  output[[3]] = justices[percentph$tree_row$order]
  # get percentmap in heatmap order
  output[[4]] = percentmat[percentph$tree_row$order, percentph$tree_row$order]
  write(toJSON(output), paste("scotus/", year, ".json", sep=""))
}