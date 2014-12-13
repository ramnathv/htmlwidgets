
HTML_FILES := $(patsubst %.Rmd, %.html ,$(wildcard *.Rmd)) \
              $(patsubst %.md, %.html ,$(wildcard *.md))

all: clean html


html: $(HTML_FILES)

%.html: %.Rmd
	R --slave -e "set.seed(100);rmarkdown::render('$<')"

%.html: %.md
	R --slave -e "set.seed(100);rmarkdown::render('$<')"

showcase_leaflet.html: geog495.RData

geog495.RData:
	curl http://geog.uoregon.edu/GeogR/data/Rdata/geog495.RData > geog495.RData

.PHONY: clean
clean:
	$(RM) $(HTML_FILES)

