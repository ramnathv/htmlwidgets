describe('static htmlwidgets', () => {
    it('should define itself globally', () => {
        expect(HTMLWidgets).toBeDefined();
    });

    it('should be OK without data (and support find())', () => {
        const nodata_widget = HTMLWidgets.find('#mockwidget-nodata');
        expect(nodata_widget).toBeDefined();
    });

    it('should support getInstance()', () => {
        const found_widget = HTMLWidgets.find('#mockwidget-nodata');
        get_instance_widget = HTMLWidgets.getInstance(document.querySelector('#mockwidget-nodata'));
        expect(get_instance_widget).toEqual(found_widget);
    });

    it("should support find() with two arguments", () => {
        const upperwidget = document.querySelector('#upperwidget');
        let found_widget = HTMLWidgets.find(upperwidget, '#mockwidget-bozo');
        expect(found_widget).toBeNull();
        found_widget = HTMLWidgets.find(upperwidget, '#mockwidget-nodata');
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

    it('should give initial state to widget and pass back changes', () => {
        let state_back_from_widget;
        HTMLWidgets.stateChangedHook = (new_state) => {
            state_back_from_widget = new_state;
        };
        const bozo_widget = HTMLWidgets.find('#mockwidget-bozo');
        expect(bozo_widget.state.meaning).toEqual(42, 'see data-for in script tag');
        const revised_state = {dog:"cat"};
        bozo_widget.simulateStateChanged(revised_state);
        expect(state_back_from_widget).toBe(revised_state);
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
