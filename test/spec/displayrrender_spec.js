describe('Displayr htmlwidgets', () => {
    it('should be OK without data', () => {
        const upper_div = document.querySelector('#upperwidget');
        const nodata_widget = HTMLWidgets.instantiateDisplayrWidget(upper_div);
        expect(nodata_widget).toBeDefined();
        expect(nodata_widget.instance.alive).toEqual(true);
        HTMLWidgets.destroyDisplayrWidget(nodata_widget);
    });

    it('should call renderValue() when data is provided', () => {
        const lower_div = document.querySelector('#lowerwidget');
        const bozo_widget = HTMLWidgets.instantiateDisplayrWidget(lower_div);
        const text_in_svg = lower_div.querySelector('text').textContent;
        expect(text_in_svg).toEqual('bozo', 'because that proves that renderValue() was called');
        HTMLWidgets.destroyDisplayrWidget(bozo_widget);
    });

    it('should allow two widgets to be active at once', () => {
        const upper_div = document.querySelector('#upperwidget');
        const lower_div = document.querySelector('#lowerwidget');
        const nodata_widget = HTMLWidgets.instantiateDisplayrWidget(upper_div);
        const bozo_widget = HTMLWidgets.instantiateDisplayrWidget(lower_div);
        expect(bozo_widget.instance.alive).toBe(true);
        expect(nodata_widget.instance.alive).toBe(true);
        HTMLWidgets.destroyDisplayrWidget(nodata_widget);
        HTMLWidgets.destroyDisplayrWidget(bozo_widget);
     });

    it('should resist instantiating a widget when one is already attached', () => {
        const upper_div = document.querySelector('#upperwidget');
        const nodata_widget = HTMLWidgets.instantiateDisplayrWidget(upper_div);
        expect(() => HTMLWidgets.instantiateDisplayrWidget(upper_div)).toThrow(new Error("A widget has already been instantiated on this DOM element.  Don't reuse DOM elements for widgets."));
        HTMLWidgets.destroyDisplayrWidget(nodata_widget);
    });

    it('should call the widget\'s destroy() member', () => {
        const upper_div = document.querySelector('#upperwidget');
        const nodata_widget = HTMLWidgets.instantiateDisplayrWidget(upper_div);
        HTMLWidgets.destroyDisplayrWidget(nodata_widget);
        expect(nodata_widget.instance.alive).toEqual(false);
    });

    it('should give initial state to widget and pass back changes', () => {
        const lower_div = document.querySelector('#lowerwidget');
        let state_back_from_widget;
        const state_changed_hook = (new_state) => {
            state_back_from_widget = new_state;
        };
        const initial_state = {meaning:42};
        const bozo_widget = HTMLWidgets.instantiateDisplayrWidget(lower_div, initial_state, state_changed_hook);
        expect(bozo_widget.instance.state).toBe(initial_state);
        const revised_state = {dog:"cat"};
        bozo_widget.instance.simulateStateChanged(revised_state);
        expect(bozo_widget.instance.state).toBe(revised_state);
        HTMLWidgets.destroyDisplayrWidget(bozo_widget);
    });
});
