import videojs from 'video.js';
import PlaylistLayoutHorizontal from './layout/playlist-layout-horizontal';
import PlaylistLayoutVertical from './layout/playlist-layout-vertical';
import PlaylistLayoutCustom from './layout/playlist-layout-custom';

// TODO: create pallete of colors
// TODO: horizontal vs vertical behaviour
// TODO: custom playlist - need to decide what we support and what is the behaviour with loop state
// TODO: cross browser check

// support VJS5 & VJS6 at the same time
const dom = videojs.dom || videojs;
const Component = videojs.getComponent('Component');


const OPTIONS_DEFAULTS = {
  fluid: false,
  show: true,
  direction: 'vertical',
  total: 4,
  selector: false,
  renderTo: []
};

const modifyOptions = (player, opt) => {
  const options = { ...OPTIONS_DEFAULTS, ...opt };

  if (options.show && typeof options.selector === 'string') {
    options.useDefaultLayout = false;
    options.useCustomLayout = true;
    options.renderTo = document.querySelector(options.selector);
    options.showAll = true;

    if (!options.renderTo.length === 0) {
      throw `Couldn't find element(s) by selector '${options.selector}' for playlist`;
    }
  }

  if (options.show && !options.selector) {
    options.useDefaultLayout = true;
    options.useCustomLayout = false;
  }

  options.direction = options.direction.toLowerCase() === 'horizontal' ? 'horizontal' : 'vertical';

  options.skin = player.options_.skin;

  return options;

};


class PlaylistWidget {
  constructor(player, options = {}) {
    options = modifyOptions(player, options);
    this.options_ = options;
    this.player_ = player;
    this.render();

    const fluidHandler = (e, fluid) => {
      this.options_.fluid = fluid;
    };

    player.on('fluid', fluidHandler);

    this.dispose = () => {
      player.off('fluid', fluidHandler);
    };
  }

  render() {
    if (this.options_.useDefaultLayout) {
      if (this.options_.direction === 'horizontal') {
        this.layout_ = new PlaylistLayoutHorizontal(this.player_, this.options_);
      } else {
        this.layout_ = new PlaylistLayoutVertical(this.player_, this.options_);
      }
    }

    if (this.options_.useCustomLayout) {
      this.layout_ = new PlaylistLayoutCustom(this.player_, this.options_);
    }
  }

  getLayout() {
    return this.layout_;
  }

  update(optionName, optionValue) {
    this.options_ = videojs.mergeOptions(this.options_, optionValue);

    if (optionName === 'direction') {
      this.layout_.removeLayout();
      this.layout_.dispose();
      this.render();
    } else {
      this.layout_.update(optionName, this.options_);
    }

  }

  total(total = OPTIONS_DEFAULTS.total) {
    total = parseInt(total);

    if (total !== this.options_.total && typeof total === 'number' && total > 0) {
      this.update('total', { total: total });
    }
  }

  direction(direction = OPTIONS_DEFAULTS.direction) {
    if (direction == 'horizontal' || direction == 'vertical') {
      this.update('direction', { direction: direction });
    }
  }

}


export default PlaylistWidget;