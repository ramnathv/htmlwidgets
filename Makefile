
HTML_FILES := $(patsubst %.Rmd, %.html ,$(wildcard *.Rmd)) \
              $(patsubst %.md, %.html ,$(wildcard *.md))

all: clean html


html: $(HTML_FILES)

%.html: %.Rmd
	Rscript compile.R "$<"

%.html: %.md
	Rscript compile.R "$<"

showcase_leaflet.html: geog495.RData

geog495.RData:
	curl http://geog.uoregon.edu/GeogR/data/Rdata/geog495.RData > geog495.RData

.PHONY: clean
clean:
	$(RM) $(HTML_FILES)

