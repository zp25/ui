/**
 * 主区域(banner)观察者
 * @param {Element} main - Carousel组件主区域(banner)
 * @param {boolean} cssCustomProp - 浏览器环境是否支持css自定义参数
 * @return {Observer}
 */
const bannerObserver = (main, cssCustomProp) => ({
  /**
   * banner切换，若不支持css自定义变量，直接修改transform属性
   * @param {Object} state - 状态
   * @param {number} state.focus - 聚焦页编号
   */
  update: (state) => {
    const { focus } = state;
    const offset = `${(1 - focus) * 100}%`;

    if (cssCustomProp) {
      main.style.setProperty('--banner-translateX', offset);
    } else {
      main.style.transform = `translate3d(${offset}, 0, 0)`;
    }
  },
});

/**
 * @ignore
 */
export default Base => class extends Base {
  /**
   * 新建Carousel实例
   */
  constructor(group = '', opts = {}) {
    super(group);

    const query = `.carousel${this.group ? `[data-group="${this.group}"]` : ''}`;
    /**
     * Carousel组件容器
     * @type {Element}
     * @public
     */
    this.carousel = document.querySelector(query);
    /**
     * Carousel组件banner区域
     * @type {Element}
     * @private
     */
    this.main = this.carousel.querySelector('.carousel__main');

    const slideBanner = this.main.querySelectorAll('.slide-banner');

    /**
     * Carousel配置
     * @type {Object}
     * @property {number} focus - 初始聚焦页，没有上边界判断
     * @property {number} delay - 轮播延时
     * @property {number} length - 总页数
     * @property {boolean} supports - 是否支持css自定义属性
     * @desc 配置初始化后不应该被修改
     */
    this.options = Object.assign({}, {
      focus: 1,
      delay: 8000,
      length: slideBanner ? slideBanner.length : 1,
    }, opts, {
      supports: (
        window.CSS && window.CSS.supports && window.CSS.supports('(--banner-translateX: 0%)')
      ),
    });

    Object.freeze(this.options);

    /**
     * 定时器
     * @type {Number}
     * @ignore
     */
    this.timeoutID = NaN;

    this.play = this.play.bind(this);

    // 添加主区域(banner)observer
    this.attach(bannerObserver(this.main, this.options.supports));
  }

  /**
   * 当前聚焦页
   * @return {(number|undefined)}
   * @public
   */
  get focus() {
    return this.subject.state.focus;
  }

  /**
   * 轮播定时器
   * @param {function} cb - 延时处理函数
   * @ignore
   */
  setTimeout(cb) {
    this.timeoutID = setTimeout(cb, this.options.delay);
  }

  /**
   * 清理轮播定时器
   * @ignore
   */
  clearTimeout() {
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
      this.timeoutID = NaN;
    }
  }

  /**
   * 播放，实例化时虽然传入focus，但不默认聚焦；运行play时，若首次运行聚焦到focus，否则下一页
   * @param {boolean} reverse=false - 是否反向播放，反向指播放编号比当前图片小1的图片
   * @return {number} 下一页编号
   * @abstract
   * @ignore
   */
  play(reverse = false) {
    const {
      focus,
      length: len,
    } = this.options;

    let next = focus;

    if (this.focus) {
      if (reverse) {
        next = this.focus <= 1 ? len : this.focus - 1;
      } else {
        next = this.focus >= len ? 1 : this.focus + 1;
      }
    }

    return next;
  }
};
