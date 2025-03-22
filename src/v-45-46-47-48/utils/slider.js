import GObject from 'gi://GObject';
import { QuickSlider } from 'resource:///org/gnome/shell/ui/quickSettings.js';

const Slider = GObject.registerClass(
    class Slider extends QuickSlider {
        _init(settings, key) {
            super._init({
                iconName: 'display-brightness-symbolic',
                x_expand: true,
            });

            this._settings = settings;
            this._dconfKey = key;

            this._holdValueForIntDoubleConversion = this._settings.get_int(this._dconfKey);

            // Watch for changes and set an accessible name for the slider
            this._sliderChangedId = this.slider.connect('notify::value',
                this._onSliderChanged.bind(this));
            this.slider.accessible_name = _('Gdm extension, Blur Brightness/Blur Sigma Slider');

            // Binding the slider to a GSettings key
            this._settings.connect(`changed::${this._dconfKey}`,
                this._onSettingsChanged.bind(this));
            this._onSettingsChanged(this._dconfKey);
        }

        _onSettingsChanged() {
            // Prevent the slider from emitting a change signal while being updated
            this.slider.block_signal_handler(this._sliderChangedId);

            if (this._dconfKey.startsWith('blur-brightness'))
                this.slider.value = this._settings.get_double(this._dconfKey);
            else
                this.slider.value = this._holdValueForIntDoubleConversion / 100;

            this.slider.unblock_signal_handler(this._sliderChangedId);
        }

        _onSliderChanged() {
            // Assuming our GSettings holds values between 0..100, adjust for the
            // slider taking values between 0..1
            const percent = this.slider.value;

            if (this._dconfKey.startsWith('blur-brightness')) {
                this._settings.set_double(this._dconfKey, percent);
            }
            else {
                this._holdValueForIntDoubleConversion = percent * 100;
                this._settings.set_int(this._dconfKey, Math.floor(percent * 100));
            }
        }
    });

export default Slider;