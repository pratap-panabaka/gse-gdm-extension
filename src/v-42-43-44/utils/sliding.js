const {GObject} = imports.gi;
const Slider = imports.ui.slider;
const PopupMenu = imports.ui.popupMenu;

var Sliding = GObject.registerClass(
    class Sliding extends PopupMenu.PopupBaseMenuItem {
        _init(settings, key) {
            super._init();
            this._settings = settings;
            this._dconfKey = key;

            this._holdValueForIntDoubleConversion = this._settings.get_int(this._dconfKey);

            this._slider = new Slider.Slider(0);

            // Watch for changes and set an accessible name for the slider
            this._sliderChangedId = this._slider.connect('notify::value', this._onSliderChanged.bind(this));
            this._slider.accessible_name = _('Gdm extension, Blur Brightness/Blur Sigma Slider');

            // Binding the slider to a GSettings key
            this._settings.connect(`changed::${this._dconfKey}`, this._onSettingsChanged.bind(this));
            this._onSettingsChanged(this._dconfKey);

            return this._slider;
        }

        _onSettingsChanged() {
            // Prevent the slider from emitting a change signal while being updated
            this._slider.block_signal_handler(this._sliderChangedId);

            if (this._dconfKey.startsWith('blur-brightness'))
                this._slider.value = this._settings.get_double(this._dconfKey);
            else
                this._slider.value = this._holdValueForIntDoubleConversion / 100;

            this._slider.unblock_signal_handler(this._sliderChangedId);
        }

        _onSliderChanged() {
            // Assuming our GSettings holds values between 0..100, adjust for the
            // slider taking values between 0..1
            const percent = this._slider.value;

            if (this._dconfKey.startsWith('blur-brightness')) {
                this._settings.set_double(this._dconfKey, percent);
            } else {
                this._holdValueForIntDoubleConversion = percent * 100;
                this._settings.set_int(this._dconfKey, Math.floor(percent * 100));
            }
        }
    }
);
