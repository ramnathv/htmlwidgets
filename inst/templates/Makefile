all: index.html

index.html: htmlwidgets/hello.js hello.R index.R
	Rscript -e "library(htmlwidgets); source('index.R'); save_html2(html)"
