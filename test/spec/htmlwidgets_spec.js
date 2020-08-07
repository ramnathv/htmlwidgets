describe('htmlwidgets', () => {
    it('should define itself globally', () => {
        expect(HTMLWidgets).toBeDefined();
    });

    it('should be OK without data (and support find())', () => {
        const nodata_widget = HTMLWidgets.find('#mockwidget-nodata');
        expect(nodata_widget).toBeDefined();
    });

    it("should support find() with two arguments", () => {
        const upperwidgets = document.querySelector('#upperwidgets');
        let found_widget = HTMLWidgets.find(upperwidgets, '#mockwidget-bozo');
        expect(found_widget).toBeNull();
        found_widget = HTMLWidgets.find(upperwidgets, '#mockwidget-nodata');
        expect(found_widget).not.toBeNull();
    });

    it("should support findAll()", () => {
        let found_widgets = HTMLWidgets.findAll('.mockwidget');
        expect(found_widgets.length).toBe(2);
    });

    it('should call renderValue() when data is provided', () => {
        const bozo_div = document.querySelector('#mockwidget-bozo');
        const text_in_svg = bozo_div.querySelector('text').textContent;
        expect(text_in_svg).toEqual('bozo');
    });

    it('should call resize when the page is resized', () => {
        const bozo_div = document.querySelector('#mockwidget-bozo');
        bozo_div.setAttribute('style', 'height: 67px');
        window.dispatchEvent(new Event('resize'));  // static render hangs off window.resize
        const bozo_svg = bozo_div.querySelector('svg');
        expect(bozo_svg.clientHeight).toEqual(67);
    });

    it("should support transposeArray2D", () => {
        const x = [[1,2,3],[4,5,6]];
        const transposed = HTMLWidgets.transposeArray2D(x);
        expect(transposed).toEqual([[1,4],[2,5],[3,6]]);
    });
});
