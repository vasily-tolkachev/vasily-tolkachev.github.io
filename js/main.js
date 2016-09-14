/******/ (function(modules) { // webpackBootstrap
/******/  // The module cache
/******/  var installedModules = {};

/******/  // The require function
/******/  function __webpack_require__(moduleId) {

/******/    // Check if module is in cache
/******/    if(installedModules[moduleId])
/******/      return installedModules[moduleId].exports;

/******/    // Create a new module (and put it into the cache)
/******/    var module = installedModules[moduleId] = {
/******/      exports: {},
/******/      id: moduleId,
/******/      loaded: false
/******/    };

/******/    // Execute the module function
/******/    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/    // Flag the module as loaded
/******/    module.loaded = true;

/******/    // Return the exports of the module
/******/    return module.exports;
/******/  }


/******/  // expose the modules object (__webpack_modules__)
/******/  __webpack_require__.m = modules;

/******/  // expose the module cache
/******/  __webpack_require__.c = installedModules;

/******/  // __webpack_public_path__
/******/  __webpack_require__.p = "";

/******/  // Load entry module and return exports
/******/  return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  __webpack_require__(1);
  __webpack_require__(2);
  __webpack_require__(4);


/***/ },
/* 1 */
/***/ function(module, exports) {

  'use strict';

  (function() {
    /**
     * @constructor
     * @param {string} image
     */
    var Resizer = function(image) {
      // Изображение, с которым будет вестись работа.
      this._image = new Image();
      this._image.src = image;

      // Холст.
      this._container = document.createElement('canvas');
      this._ctx = this._container.getContext('2d');

      // Создаем холст только после загрузки изображения.
      this._image.onload = function() {
        // Размер холста равен размеру загруженного изображения. Это нужно
        // для удобства работы с координатами.
        this._container.width = this._image.naturalWidth;
        this._container.height = this._image.naturalHeight;

        /**
         * Предлагаемый размер кадра в виде коэффициента относительно меньшей
         * стороны изображения.
         * @const
         * @type {number}
         */
        var INITIAL_SIDE_RATIO = 0.75;

        // Размер меньшей стороны изображения.
        var side = Math.min(
            this._container.width * INITIAL_SIDE_RATIO,
            this._container.height * INITIAL_SIDE_RATIO);

        // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
        // от размера меньшей стороны.
        this._resizeConstraint = new Square(this._container.width / 2 - side / 2, this._container.height / 2 - side / 2, side);

        // Отрисовка изначального состояния канваса.
        this.setConstraint();
      }.bind(this);

      // Фиксирование контекста обработчиков.
      this._onDragStart = this._onDragStart.bind(this);
      this._onDragEnd = this._onDragEnd.bind(this);
      this._onDrag = this._onDrag.bind(this);
    };

    var drawDot = function(coordinate, dotRadius, color, context) {
      context.beginPath();
      context.arc(coordinate.x, coordinate.y, dotRadius, 0, 2 * Math.PI);
      context.fillStyle = color;
      context.fill();
    };

    var drawDottedLine = function(firstPoint, secondPoint, lineWidth, color, context) {
      var dotRadius = lineWidth / 2;
      var indent = 2 * dotRadius;
      var currentDotCoord = new Coordinate(firstPoint.x, firstPoint.y);

      var dx = secondPoint.x - firstPoint.x;
      var dy = secondPoint.y - firstPoint.y;

      var steps = 0;
      if (Math.abs(dx) > Math.abs(dy)) {
        steps = parseInt(Math.abs(dx) / (2 * dotRadius + indent), 10);
      } else {
        steps = parseInt(Math.abs(dy) / (2 * dotRadius + indent), 10);
      }

      var xIncrement = dx / steps;
      var yIncrement = dy / steps;

      for(var i = 0; i < steps; i++) {
        drawDot(currentDotCoord, dotRadius, color, context);
        currentDotCoord.x += xIncrement;
        currentDotCoord.y += yIncrement;
      }
    };

    var drawDottedSquare = function(strokeWidth, color, context, square) {
      var array = [new Coordinate(square.x, square.y),
                   new Coordinate(square.x + square.side, square.y),
                   new Coordinate(square.x + square.side, square.y + square.side),
                   new Coordinate(square.x, square.y + square.side),
                   new Coordinate(square.x, square.y)];

      for (var i = 0; i < array.length - 1; i++) {
        drawDottedLine(array[i], array[i + 1], strokeWidth, color, context);
      }
    };

    Resizer.prototype = {
      /**
       * Родительский элемент канваса.
       * @type {Element}
       * @private
       */
      _element: null,

      /**
       * Положение курсора в момент перетаскивания. От положения курсора
       * рассчитывается смещение на которое нужно переместить изображение
       * за каждую итерацию перетаскивания.
       * @type {Coordinate}
       * @private
       */
      _cursorPosition: null,

      /**
       * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
       * от верхнего левого угла исходного изображения.
       * @type {Square}
       * @private
       */
      _resizeConstraint: null,

      /**
       * Отрисовка канваса.
       */
      redraw: function() {
        // Очистка изображения.
        this._ctx.clearRect(0, 0, this._container.width, this._container.height);

        // Сохранение состояния канваса.
        // Подробней см. строку 132.
        this._ctx.save();

        // Установка начальной точки системы координат в центр холста.
        this._ctx.translate(this._container.width / 2, this._container.height / 2);

        var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
        var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);

        // Отрисовка изображения на холсте. Параметры задают изображение, которое
        // нужно отрисовать и координаты его верхнего левого угла.
        // Координаты задаются от центра холста.
        this._ctx.drawImage(this._image, displX, displY);

        var strokeWidth = 4;

        var square = new Square(
            -this._resizeConstraint.side / 2,
            -this._resizeConstraint.side / 2,
            this._resizeConstraint.side);

        // Отрисовка пунктирной рамки
        drawDottedSquare(strokeWidth, '#ffe753', this._ctx, square);

        var clippingRegion = new Square(
            (-this._resizeConstraint.side / 2) - strokeWidth / 2,
            (-this._resizeConstraint.side / 2) - strokeWidth / 2,
            this._resizeConstraint.side + strokeWidth);

        this._ctx.beginPath();
        this._ctx.moveTo(-this._container.width / 2, -this._container.height / 2);
        this._ctx.lineTo(-this._container.width / 2, this._container.height / 2);
        this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
        this._ctx.lineTo(this._container.width / 2, -this._container.height / 2);
        this._ctx.lineTo(-this._container.width / 2, -this._container.height / 2);

        this._ctx.moveTo(clippingRegion.x, clippingRegion.y);
        this._ctx.lineTo(clippingRegion.x + clippingRegion.side, clippingRegion.y);
        this._ctx.lineTo(clippingRegion.x + clippingRegion.side, clippingRegion.y + clippingRegion.side);
        this._ctx.lineTo(clippingRegion.x, clippingRegion.y + clippingRegion.side);
        this._ctx.lineTo(clippingRegion.x, clippingRegion.y);
        this._ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this._ctx.fill('evenodd');

        this._ctx.fillStyle = 'white';
        this._ctx.font = '16px Tahoma';
        this._ctx.textAlign = 'center';
        this._ctx.textBaseline = 'bottom';
        this._ctx.fillText(this._image.naturalWidth + ' x ' + this._image.naturalHeight, 0, clippingRegion.y - 5);

        // Восстановление состояния канваса, которое было до вызова ctx.save
        // и последующего изменения системы координат. Нужно для того, чтобы
        // следующий кадр рисовался с привычной системой координат, где точка
        // 0 0 находится в левом верхнем углу холста, в противном случае
        // некорректно сработает даже очистка холста или нужно будет использовать
        // сложные рассчеты для координат прямоугольника, который нужно очистить.
        this._ctx.restore();
      },

      /**
       * Включение режима перемещения. Запоминается текущее положение курсора,
       * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
       * позволяющие перерисовывать изображение по мере перетаскивания.
       * @param {number} x
       * @param {number} y
       * @private
       */
      _enterDragMode: function(x, y) {
        this._cursorPosition = new Coordinate(x, y);
        document.body.addEventListener('mousemove', this._onDrag);
        document.body.addEventListener('mouseup', this._onDragEnd);
      },

      /**
       * Выключение режима перемещения.
       * @private
       */
      _exitDragMode: function() {
        this._cursorPosition = null;
        document.body.removeEventListener('mousemove', this._onDrag);
        document.body.removeEventListener('mouseup', this._onDragEnd);
      },

      /**
       * Перемещение изображения относительно кадра.
       * @param {number} x
       * @param {number} y
       * @private
       */
      updatePosition: function(x, y) {
        this.moveConstraint(
            this._cursorPosition.x - x,
            this._cursorPosition.y - y);
        this._cursorPosition = new Coordinate(x, y);
      },

      /**
       * @param {MouseEvent} evt
       * @private
       */
      _onDragStart: function(evt) {
        this._enterDragMode(evt.clientX, evt.clientY);
      },

      /**
       * Обработчик окончания перетаскивания.
       * @private
       */
      _onDragEnd: function() {
        this._exitDragMode();
      },

      /**
       * Обработчик события перетаскивания.
       * @param {MouseEvent} evt
       * @private
       */
      _onDrag: function(evt) {
        this.updatePosition(evt.clientX, evt.clientY);
      },

      /**
       * Добавление элемента в DOM.
       * @param {Element} element
       */
      setElement: function(element) {
        if (this._element === element) {
          return;
        }

        this._element = element;
        this._element.insertBefore(this._container, this._element.firstChild);
        // Обработчики начала и конца перетаскивания.
        this._container.addEventListener('mousedown', this._onDragStart);
      },

      /**
       * Возвращает кадрирование элемента.
       * @return {Square}
       */
      getConstraint: function() {
        return this._resizeConstraint;
      },

      /**
       * Смещает кадрирование на значение указанное в параметрах.
       * @param {number} deltaX
       * @param {number} deltaY
       * @param {number} deltaSide
       */
      moveConstraint: function(deltaX, deltaY, deltaSide) {
        this.setConstraint(
            this._resizeConstraint.x + (deltaX || 0),
            this._resizeConstraint.y + (deltaY || 0),
            this._resizeConstraint.side + (deltaSide || 0));
      },

      constraintIsValid: function(x, y, side) {
        return x + side <= this._image.naturalWidth
         && y + side <= this._image.naturalHeight
         && x >= 0 && y >= 0 && side >= 0
         && x !== 'undefined'
         && y !== 'undefined'
         && side !== 'undefined';
      },

      /**
       * @param {number} x
       * @param {number} y
       * @param {number} side
       */
      setConstraint: function(x, y, side) {
        if (this.constraintIsValid(x, y, side)) {
          this._resizeConstraint.x = x;
          this._resizeConstraint.y = y;
          this._resizeConstraint.side = side;
        }

        requestAnimationFrame(function() {
          this.redraw();
          window.dispatchEvent(new CustomEvent('resizerchange'));
        }.bind(this));
      },

      /**
       * Удаление. Убирает контейнер из родительского элемента, убирает
       * все обработчики событий и убирает ссылки.
       */
      remove: function() {
        this._element.removeChild(this._container);

        this._container.removeEventListener('mousedown', this._onDragStart);
        this._container = null;
      },

      /**
       * Экспорт обрезанного изображения как HTMLImageElement и исходником
       * картинки в src в формате dataURL.
       * @return {Image}
       */
      exportImage: function() {
        // Создаем Image, с размерами, указанными при кадрировании.
        var imageToExport = new Image();

        // Создается новый canvas, по размерам совпадающий с кадрированным
        // изображением, в него добавляется изображение взятое из канваса
        // с измененными координатами и сохраняется в dataURL, с помощью метода
        // toDataURL. Полученный исходный код, записывается в src у ранее
        // созданного изображения.
        var temporaryCanvas = document.createElement('canvas');
        var temporaryCtx = temporaryCanvas.getContext('2d');
        temporaryCanvas.width = this._resizeConstraint.side;
        temporaryCanvas.height = this._resizeConstraint.side;
        temporaryCtx.drawImage(this._image,
            -this._resizeConstraint.x,
            -this._resizeConstraint.y);
        imageToExport.src = temporaryCanvas.toDataURL('image/png');

        return imageToExport;
      }
    };

    /**
     * Вспомогательный тип, описывающий квадрат.
     * @constructor
     * @param {number} x
     * @param {number} y
     * @param {number} side
     * @private
     */
    var Square = function(x, y, side) {
      this.x = x;
      this.y = y;
      this.side = side;
    };

    /**
     * Вспомогательный тип, описывающий координату.
     * @constructor
     * @param {number} x
     * @param {number} y
     * @private
     */
    var Coordinate = function(x, y) {
      this.x = x;
      this.y = y;
    };

    window.Resizer = Resizer;
  })();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

  /* global Resizer: true */

  /**
   * @fileoverview
   * @author Igor Alexeenko (o0)
   */

  'use strict';

  (function() {

    var browserCookies = __webpack_require__(3);

    /** @enum {string} */
    var FileType = {
      'GIF': '',
      'JPEG': '',
      'PNG': '',
      'SVG+XML': ''
    };

    /** @enum {number} */
    var Action = {
      ERROR: 0,
      UPLOADING: 1,
      CUSTOM: 2
    };

    /**
     * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
     * из ключей FileType.
     * @type {RegExp}
     */
    var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

    /**
     * @type {Object.<string, string>}
     */
    var filterMap;

    /**
     * Объект, который занимается кадрированием изображения.
     * @type {Resizer}
     */
    var currentResizer;

    var leftInput = document.querySelector('#resize-x');
    leftInput.min = 0;

    var topInput = document.querySelector('#resize-y');
    topInput.min = 0;

    var sideInput = document.querySelector('#resize-size');
    sideInput.min = 0;

    var submitBtn = document.querySelector('#resize-fwd');

    var filterNone = document.querySelector('#upload-filter-none');
    var filterChrome = document.querySelector('#upload-filter-chrome');
    var filterSepia = document.querySelector('#upload-filter-sepia');

    /**
     * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
     * изображением.
     */
    function cleanupResizer() {
      if (currentResizer) {
        currentResizer.remove();
        currentResizer = null;
      }
    }

    /**
     * Ставит одну из трех случайных картинок на фон формы загрузки.
     */
    function updateBackground() {
      var images = [
        'img/logo-background-1.jpg',
        'img/logo-background-2.jpg',
        'img/logo-background-3.jpg'
      ];

      var backgroundElement = document.querySelector('.upload');
      var randomImageNumber = Math.round(Math.random() * (images.length - 1));
      backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
    }

    function setSideConstraint() {
      var leftValue = parseInt(leftInput.value, 10) || 0;
      var topValue = parseInt(topInput.value, 10) || 0;
      var sideMax = Math.min(currentResizer._image.naturalWidth - leftValue, currentResizer._image.naturalHeight - topValue);
      sideInput.max = sideMax >= 0 ? sideMax : 0;
    }

    function setIndentsConstraint() {
      var sideValue = parseInt(sideInput.value, 10) || 0;
      var leftMax = currentResizer._image.naturalWidth - sideValue;
      leftInput.max = leftMax >= 0 ? leftMax : 0;
      var topMax = currentResizer._image.naturalHeight - sideValue;
      topInput.max = topMax >= 0 ? topMax : 0;
    }

    leftInput.addEventListener('input', function() {
      setSideConstraint();
    });

    topInput.addEventListener('input', function() {
      setSideConstraint();
    });

    sideInput.addEventListener('input', function() {
      setIndentsConstraint();
    });

    /**
     * Проверяет, валидны ли данные, в форме кадрирования.
     * @return {boolean}
     */
    function resizeFormIsValid() {
      var imageWidth = currentResizer._image.naturalWidth;
      var imageHeight = currentResizer._image.naturalHeight;

      var leftValue = parseInt(leftInput.value, 10) || 0;
      var topValue = parseInt(topInput.value, 10) || 0;
      var sideValue = parseInt(sideInput.value, 10) || 0;

      return (leftValue + sideValue <= imageWidth)
       && (topValue + sideValue <= imageHeight)
       && (leftValue >= 0 && topValue >= 0 && sideValue >= 0);
    }

    /**
     * Форма загрузки изображения.
     * @type {HTMLFormElement}
     */
    var uploadForm = document.forms['upload-select-image'];

    /**
     * Форма кадрирования изображения.
     * @type {HTMLFormElement}
     */
    var resizeForm = document.forms['upload-resize'];

    /**
     * Форма добавления фильтра.
     * @type {HTMLFormElement}
     */
    var filterForm = document.forms['upload-filter'];

    /**
     * @type {HTMLImageElement}
     */
    var filterImage = filterForm.querySelector('.filter-image-preview');

    /**
     * @type {HTMLElement}
     */
    var uploadMessage = document.querySelector('.upload-message');

    /**
     * @param {Action} action
     * @param {string=} message
     * @return {Element}
     */
    function showMessage(action, message) {
      var isError = false;

      switch (action) {
        case Action.UPLOADING:
          message = message || 'Кексограмим&hellip;';
          break;

        case Action.ERROR:
          isError = true;
          message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
          break;
      }

      uploadMessage.querySelector('.upload-message-container').innerHTML = message;
      uploadMessage.classList.remove('invisible');
      uploadMessage.classList.toggle('upload-message-error', isError);
      return uploadMessage;
    }

    function hideMessage() {
      uploadMessage.classList.add('invisible');
    }

    function getNumDaysAfterBirthday() {
      var birthday = new Date('2015-12-30');
      var currentDate = new Date(Date.now());
      var year = currentDate.getFullYear();
      birthday.setFullYear(year);
      if (currentDate - birthday < 0) {
        birthday.setFullYear(year - 1);
      }
      return currentDate - birthday;
    }

    /**
     * Обработчик изменения изображения в форме загрузки. Если загруженный
     * файл является изображением, считывается исходник картинки, создается
     * Resizer с загруженной картинкой, добавляется в форму кадрирования
     * и показывается форма кадрирования.
     * @param {Event} evt
     */
    uploadForm.addEventListener('change', function(evt) {
      var element = evt.target;
      if (element.id === 'upload-file') {
        // Проверка типа загружаемого файла, тип должен быть изображением
        // одного из форматов: JPEG, PNG, GIF или SVG.
        if (fileRegExp.test(element.files[0].type)) {
          var fileReader = new FileReader();

          showMessage(Action.UPLOADING);

          fileReader.onload = function() {
            cleanupResizer();

            currentResizer = new Resizer(fileReader.result);
            currentResizer.setElement(resizeForm);
            uploadMessage.classList.add('invisible');

            setSideConstraint();
            setIndentsConstraint();

            uploadForm.classList.add('invisible');
            resizeForm.classList.remove('invisible');

            hideMessage();
          };

          fileReader.readAsDataURL(element.files[0]);
        } else {
          // Показ сообщения об ошибке, если загружаемый файл, не является
          // поддерживаемым изображением.
          showMessage(Action.ERROR);
        }
      }
    });

    /**
     * Обработка сброса формы кадрирования. Возвращает в начальное состояние
     * и обновляет фон.
     * @param {Event} evt
     */
    resizeForm.onreset = function(evt) {
      evt.preventDefault();

      cleanupResizer();
      updateBackground();

      resizeForm.classList.add('invisible');
      uploadForm.classList.remove('invisible');
    };

    /**
     * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
     * кропнутое изображение в форму добавления фильтра и показывает ее.
     * @param {Event} evt
     */
    resizeForm.addEventListener('submit', function(evt) {
      evt.preventDefault();

      if (resizeFormIsValid()) {
        filterImage.src = currentResizer.exportImage().src;

        var lastFilter = browserCookies.get('filter');
        if (lastFilter === filterSepia.value) {
          filterSepia.setAttribute('checked', 'checked');
          filterImage.classList.add('filter-sepia');
        } else if (lastFilter === filterChrome.value) {
          filterChrome.setAttribute('checked', 'checked');
          filterImage.classList.add('filter-chrome');
        } else {
          filterNone.setAttribute('checked', 'checked');
          filterImage.classList.add('filter-none');
        }

        resizeForm.classList.add('invisible');
        filterForm.classList.remove('invisible');
      }
    });

    resizeForm.addEventListener('input', function() {
      if (!resizeFormIsValid()) {
        submitBtn.setAttribute('disabled', 'disabled');
      } else {
        var leftValue = parseInt(leftInput.value, 10) || 0;
        var topValue = parseInt(topInput.value, 10) || 0;
        var sideValue = parseInt(sideInput.value, 10) || 0;
        currentResizer.setConstraint(leftValue, topValue, sideValue);

        submitBtn.removeAttribute('disabled', 'disabled');
      }
    });

    /**
     * Сброс формы фильтра. Показывает форму кадрирования.
     * @param {Event} evt
     */
    filterForm.addEventListener('reset', function(evt) {
      evt.preventDefault();

      filterForm.classList.add('invisible');
      resizeForm.classList.remove('invisible');
    });

    /**
     * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
     * записав сохраненный фильтр в cookie.
     * @param {Event} evt
     */
    filterForm.addEventListener('submit', function(evt) {
      evt.preventDefault();

      var date = new Date(Date.now() + getNumDaysAfterBirthday());
      if (filterNone.checked) {
        browserCookies.set('filter', filterNone.value, {expires: date});
      } else if (filterChrome.checked) {
        browserCookies.set('filter', filterChrome.value, {expires: date});
      } else if (filterSepia.checked) {
        browserCookies.set('filter', filterSepia.value, {expires: date});
      }

      cleanupResizer();
      updateBackground();

      filterForm.classList.add('invisible');
      uploadForm.classList.remove('invisible');
    });

    /**
     * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
     * выбранному значению в форме.
     */
    filterForm.addEventListener('change', function() {
      if (!filterMap) {
        // Ленивая инициализация. Объект не создается до тех пор, пока
        // не понадобится прочитать его в первый раз, а после этого запоминается
        // навсегда.
        filterMap = {
          'none': 'filter-none',
          'chrome': 'filter-chrome',
          'sepia': 'filter-sepia'
        };
      }

      var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
        return item.checked;
      })[0].value;

      // Класс перезаписывается, а не обновляется через classList потому что нужно
      // убрать предыдущий примененный класс. Для этого нужно или запоминать его
      // состояние или просто перезаписывать.
      filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
    });

    window.addEventListener('resizerchange', function() {
      var x = currentResizer.getConstraint().x;
      var y = currentResizer.getConstraint().y;
      var side = currentResizer.getConstraint().side;

      if (currentResizer.constraintIsValid(x, y, side)) {
        var imageWidth = currentResizer._image.naturalWidth;
        var imageHeight = currentResizer._image.naturalHeight;
        leftInput.value = parseInt(x, 10);
        topInput.value = parseInt(y, 10);
        sideInput.value = parseInt(side, 10);

        var sideMax = Math.min(imageWidth - leftInput.value, imageHeight - topInput.value);
        sideInput.max = sideMax >= 0 ? sideMax : 0;
        var leftMax = imageWidth - sideInput.value;
        leftInput.max = leftMax >= 0 ? leftMax : 0;
        var topMax = imageHeight - sideInput.value;
        topInput.max = topMax >= 0 ? topMax : 0;
      }
    });

    cleanupResizer();
    updateBackground();
  })();


/***/ },
/* 3 */
/***/ function(module, exports) {

  exports.defaults = {};

  exports.set = function(name, value, options) {
    // Retrieve options and defaults
    var opts = options || {};
    var defaults = exports.defaults;

    // Apply default value for unspecified options
    var expires  = opts.expires || defaults.expires;
    var domain   = opts.domain  || defaults.domain;
    var path     = opts.path     != undefined ? opts.path     : (defaults.path != undefined ? defaults.path : '/');
    var secure   = opts.secure   != undefined ? opts.secure   : defaults.secure;
    var httponly = opts.httponly != undefined ? opts.httponly : defaults.httponly;

    // Determine cookie expiration date
    // If succesful the result will be a valid Date, otherwise it will be an invalid Date or false(ish)
    var expDate = expires ? new Date(
        // in case expires is an integer, it should specify the number of days till the cookie expires
        typeof expires == 'number' ? new Date().getTime() + (expires * 864e5) :
        // else expires should be either a Date object or in a format recognized by Date.parse()
        expires
    ) : '';

    // Set cookie
    document.cookie = name.replace(/[^+#$&^`|]/g, encodeURIComponent)                // Encode cookie name
    .replace('(', '%28')
    .replace(')', '%29') +
    '=' + value.replace(/[^+#$&/:<-\[\]-}]/g, encodeURIComponent) +                  // Encode cookie value (RFC6265)
    (expDate && expDate.getTime() >= 0 ? ';expires=' + expDate.toUTCString() : '') + // Add expiration date
    (domain   ? ';domain=' + domain : '') +                                          // Add domain
    (path     ? ';path='   + path   : '') +                                          // Add path
    (secure   ? ';secure'           : '') +                                          // Add secure option
    (httponly ? ';httponly'         : '');                                           // Add httponly option
  };

  exports.get = function(name) {
    var cookies = document.cookie.split(';');

    // Iterate all cookies
    for(var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var cookieLength = cookie.length;

      // Determine separator index ("name=value")
      var separatorIndex = cookie.indexOf('=');

      // IE<11 emits the equal sign when the cookie value is empty
      separatorIndex = separatorIndex < 0 ? cookieLength : separatorIndex;

      // Decode the cookie name and remove any leading/trailing spaces, then compare to the requested cookie name
      if (decodeURIComponent(cookie.substring(0, separatorIndex).replace(/^\s+|\s+$/g, '')) == name) {
        return decodeURIComponent(cookie.substring(separatorIndex + 1, cookieLength));
      }
    }

    return null;
  };

  exports.erase = function(name, options) {
    exports.set(name, '', {
      expires:  -1,
      domain:   options && options.domain,
      path:     options && options.path,
      secure:   0,
      httponly: 0}
    );
  };


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var THROTTLE_DELAY = 100;
  var PAGE_SIZE = 12;

  var pageNumber = 0;
  var filteredPictures = [];
  var scrollTimeout;
  var filtersContainer = document.querySelector('.filters');
  var pictures = [];
  var picturesContainer = document.querySelector('.pictures');

  var renderPicturesPage = __webpack_require__(5);
  var getFilteredPictures = __webpack_require__(10);
  var utilities = __webpack_require__(8);
  var getPictures = __webpack_require__(11);
  var gallery = __webpack_require__(12);

  var scrollThrottler = function() {
    if (!scrollTimeout) {
      scrollTimeout = setTimeout(function() {
        scrollTimeout = null;
        drawNextPage();
      }, THROTTLE_DELAY);
    }
  };

  var drawNextPage = function() {
    if (utilities.isBottomReached() && utilities.isNextPageAvailable(filteredPictures, pageNumber, PAGE_SIZE)) {
      pageNumber++;
      renderPicturesPage(filteredPictures, pageNumber, false);
    }
  };

  var setFilterEnabled = function(filter) {
    pageNumber = 0;
    filteredPictures = getFilteredPictures(pictures, filter);
    gallery.savePictures(filteredPictures);

    if (filteredPictures.length === 0) {
      picturesContainer.classList.add('pictures-not-found');
      renderPicturesPage(filteredPictures, pageNumber, true);
    } else {
      picturesContainer.classList.remove('pictures-not-found');
      renderPicturesPage(filteredPictures, pageNumber, true);

      while (utilities.isBottomReached() && utilities.isNextPageAvailable(filteredPictures, pageNumber, PAGE_SIZE)) {
        pageNumber++;
        renderPicturesPage(filteredPictures, pageNumber, false);
      }
    }
  };

  var setFiltrationEnabled = function() {
    filtersContainer.addEventListener('click', function(evt) {
      if (evt.target.classList.contains('filters-radio')) {
        setFilterEnabled(evt.target.value);
      }
    });
  };

  getPictures(function(loadedPictures) {
    pictures = loadedPictures;
    setFiltrationEnabled();
    setFilterEnabled(localStorage.getItem('filter'));
    if (utilities.getHash() !== '') {
      gallery._onHashChange();
    }
    window.addEventListener('scroll', scrollThrottler);
  });


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var PAGE_SIZE = 12;

  var picturesContainer = document.querySelector('.pictures');
  var Photo = __webpack_require__(6);
  var renderedPictures = [];

  module.exports = function(loadedPictures, page, replace) {
    if(replace) {
      renderedPictures.forEach(function(photo) {
        photo.remove();
      });
      renderedPictures = [];
    }

    var from = page * PAGE_SIZE;
    var to = from + PAGE_SIZE;

    loadedPictures.slice(from, to).forEach(function(picture) {
      renderedPictures.push(new Photo(picture, picturesContainer));
    });
  };


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var getPictureElement = __webpack_require__(7);
  var utilities = __webpack_require__(8);
  var BaseComponent = __webpack_require__(9);

  var onElementAction = function(evt, data) {
    if (evt.target.tagName === 'IMG') {
      evt.preventDefault();
      location.hash = '#photo/' + data.url;
    }
  };

  var Photo = function(data, container) {
    BaseComponent.call(this, data);
    this.element.addEventListener('click', this.onPictureClick.bind(this));
    this.element.addEventListener('keydown', this.onPictureKeydown.bind(this));
    this._addToParentContainer(container);
  };

  utilities.inherit(BaseComponent, Photo);

  Photo.prototype._createDomElement = function() {
    return getPictureElement(this.data);
  };

  Photo.prototype.onPictureKeydown = function(evt) {
    if (utilities.isActivationEvent(evt)) {
      onElementAction(evt, this.data);
    }
  };

  Photo.prototype.onPictureClick = function(evt) {
    onElementAction(evt, this.data);
  };

  Photo.prototype.remove = function() {
    this.element.removeEventListener('click', this.onPictureClick.bind(this));
    this.element.removeEventListener('keydown', this.onPictureClick.bind(this));
    this.element.parentNode.removeChild(this.element);
  };

  module.exports = Photo;


/***/ },
/* 7 */
/***/ function(module, exports) {

  'use strict';

  var IMAGE_WIDTH = 182;
  var IMAGE_HEIGTH = 182;
  var IMAGE_LOAD_TIMEOUT = 10000;

  var templateElement = document.querySelector('template');
  var elementToClone;

  if ('content' in templateElement) {
    elementToClone = templateElement.content.querySelector('.picture');
  } else {
    elementToClone = templateElement.querySelector('.picture');
  }

  var getPictureElement = function(data) {
    var element = elementToClone.cloneNode(true);

    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

    var imageTag = element.querySelector('img');
    var image = new Image(IMAGE_WIDTH, IMAGE_HEIGTH);
    var pictureLoadTimeout;

    image.onload = function(evt) {
      clearTimeout(pictureLoadTimeout);
      imageTag.src = evt.target.src;
      imageTag.width = IMAGE_WIDTH;
      imageTag.height = IMAGE_HEIGTH;
    };

    image.onerror = function() {
      clearTimeout(pictureLoadTimeout);
      element.classList.add('picture-load-failure');
    };

    image.src = data.url;

    pictureLoadTimeout = setTimeout(function() {
      image.src = '';
      element.classList.add('picture-load-failure');
    }, IMAGE_LOAD_TIMEOUT);

    return element;
  };

  module.exports = getPictureElement;


/***/ },
/* 8 */
/***/ function(module, exports) {

  'use strict';

  var GAP = 50;

  var KeyCode = {
    ENTER: 13,
    ESC: 27,
    SPACE: 32
  };

  module.exports = {
    getPageHeight: function() {
      return Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );
    },
    isActivationEvent: function(evt) {
      return [KeyCode.ENTER, KeyCode.SPACE].indexOf(evt.keyCode) > -1;
    },
    isDeactivationEvent: function(evt) {
      return evt.keyCode === KeyCode.ESC;
    },
    isBottomReached: function() {
      var pageHeight = this.getPageHeight();
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var space = pageHeight - (scrollTop + document.documentElement.clientHeight);
      return space < GAP;
    },
    isNextPageAvailable: function(picturesList, page, pageSize) {
      return page < Math.floor(picturesList.length / pageSize);
    },
    changeHash: function(newHashString) {
      window.location.hash = newHashString;
    },
    getHash: function() {
      return window.location.hash;
    },
    inherit: function(Parent, Child) {
      var EmptyCtor = function() {};
      EmptyCtor.prototype = Parent.prototype;
      Child.prototype = new EmptyCtor();
    }
  };


/***/ },
/* 9 */
/***/ function(module, exports) {

  'use strict';

  var BaseComponent = function(data) {
    this.data = data;
    this.element = this._createDomElement();
  };

  BaseComponent.prototype._createDomElement = function() {
    var element;
    return element;
  };

  BaseComponent.prototype._addToParentContainer = function(container) {
    container.appendChild(this.element);
  };

  BaseComponent.prototype.remove = function() {
    this.element.parentNode.removeChild(this.element);
  };

  module.exports = BaseComponent;


/***/ },
/* 10 */
/***/ function(module, exports) {

  'use strict';

  var filtersContainer = document.querySelector('.filters');
  var filterInputs = filtersContainer['filter'];
  var DAYS_LIMIT = 4;

  var compareCommentsNumber = function(a, b) {
    if (b.comments < a.comments) {
      return -1;
    }
    if (b.comments > a.comments) {
      return 1;
    }
    return 0;
  };

  var compareDate = function(a, b) {
    var firstDate = new Date(a.date);
    var secondDate = new Date(b.date);

    if (secondDate < firstDate) {
      return -1;
    }
    if (secondDate > firstDate) {
      return 1;
    }
    return 0;
  };

  var isPictureNew = function(picture) {
    //количество дней от даты публикации до текущего момента
    var daysAre = (Date.now() - Date.parse(picture.date)) / 24 / 60 / 60 / 1000;
    return daysAre <= DAYS_LIMIT;
  };

  var filtersList = [
    {
      value: 'new',
      filteringMethod: function(picturesToFilter) {
        return picturesToFilter.sort(compareDate).filter(isPictureNew);
      }
    },
    {
      value: 'discussed',
      filteringMethod: function(picturesToFilter) {
        return picturesToFilter.sort(compareCommentsNumber);
      }
    },
    {
      value: 'popular',
      default: true,
      filteringMethod: function(picturesToFilter) {
        return picturesToFilter.filter(function() {
          return true;
        });
      }
    }
  ];

  var defaultFilter = filtersList.filter(function(filter) {
    return filter.default;
  })[0];

  var getFilteredPictures = function(picturesToFilter, filterName) {
    var pictures = picturesToFilter.slice(0);
    filterName = filterName || defaultFilter.value;
    localStorage.setItem('filter', filterName);
    var currentFilter = filtersList.filter(function(filter) {
      return filter.value === filterName;
    })[0];

    [].filter.call(filterInputs, function(item) {
      if (item.value === filterName) {
        item.setAttribute('checked', 'checked');
      }
    });

    return currentFilter.filteringMethod(pictures);
  };

  module.exports = getFilteredPictures;


/***/ },
/* 11 */
/***/ function(module, exports) {

  'use strict';

  var XHR_TIMEOUT = 10000;
  var PICTURES_LOAD_URL = '//o0.github.io/assets/json/pictures.json';

  var picturesContainer = document.querySelector('.pictures');
  var filtersContainer = document.querySelector('.filters');

  var onFailure = function() {
    picturesContainer.classList.remove('pictures-loading');
    picturesContainer.classList.add('pictures-failure');
    filtersContainer.classList.remove('hidden');
  };

  var getPictures = function(callback) {
    filtersContainer.classList.add('hidden');
    var xhr = new XMLHttpRequest();

    xhr.onload = function(evt) {
      picturesContainer.classList.remove('pictures-loading');
      var loadedData = JSON.parse(evt.target.response);
      callback(loadedData);
      filtersContainer.classList.remove('hidden');
    };

    xhr.onerror = onFailure;

    xhr.timeout = XHR_TIMEOUT;
    xhr.ontimeout = onFailure;

    picturesContainer.classList.add('pictures-loading');

    xhr.open('GET', PICTURES_LOAD_URL);
    xhr.send();
  };

  module.exports = getPictures;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

  'use strict';

  var utilities = __webpack_require__(8);
  var BaseComponent = __webpack_require__(9);
  var HASH_PATH = '#photo/';


  var Gallery = function() {
    BaseComponent.call(this);
    this.preview = this.element.querySelector('.gallery-overlay-image');
    this.likes = this.element.querySelector('.likes-count');
    this.comments = this.element.querySelector('.comments-count');
    this.closeElement = this.element.querySelector('.gallery-overlay-close');

    this.galleryPictures = [];
    this.activePictureNumber = 0;

    this.savePictures = this.savePictures.bind(this);
    this._showGallery = this._showGallery.bind(this);
    this._fillGallery = this._fillGallery.bind(this);
    this._getElementByUrl = this._getElementByUrl.bind(this);
    this._hideGallery = this._hideGallery.bind(this);
    this._onPhotoClick = this._onPhotoClick.bind(this);
    this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
    this._onHashChange = this._onHashChange.bind(this);

    window.addEventListener('hashchange', this._onHashChange);
  };

  utilities.inherit(BaseComponent, Gallery);

  Gallery.prototype._createDomElement = function() {
    return document.querySelector('.gallery-overlay');
  };

  Gallery.prototype.savePictures = function(pictures) {
    this.galleryPictures = pictures;
  };

  Gallery.prototype._showGallery = function(pictureUrl) {
    var picture = this._getElementByUrl(pictureUrl);
    this.activePictureNumber = this.galleryPictures.indexOf(picture);
    this._fillGallery(picture);
    this.element.classList.remove('invisible');

    document.addEventListener('keydown', this._onDocumentKeyDown);
    this.preview.addEventListener('click', this._onPhotoClick);
    this.closeElement.addEventListener('click', this._hideGallery);
  };

  Gallery.prototype._fillGallery = function(activePicture) {
    this.preview.src = activePicture.url;
    this.likes.textContent = activePicture.likes;
    this.comments.textContent = activePicture.comments;
  };

  Gallery.prototype._getElementByUrl = function(pictureUrl) {
    var picture = this.galleryPictures.filter(function(item) {
      return item.url === pictureUrl;
    })[0];
    return picture;
  };

  Gallery.prototype._hideGallery = function() {
    this.element.classList.add('invisible');
    utilities.changeHash('');

    this.preview.removeEventListener('click', this._onPhotoClick);
    document.removeEventListener('keydown', this._onDocumentKeyDown);
    this.closeElement.removeEventListener('click', this._hideGallery);
  };

  Gallery.prototype._onPhotoClick = function() {
    if (this.activePictureNumber < this.galleryPictures.length - 1) {
      this.activePictureNumber++;
      var currentSrc = this.galleryPictures[this.activePictureNumber].url;
      utilities.changeHash(HASH_PATH + currentSrc);
    }
  };

  Gallery.prototype._onDocumentKeyDown = function(evt) {
    if (utilities.isDeactivationEvent(evt)) {
      evt.preventDefault();
      this._hideGallery();
    }
  };

  Gallery.prototype._onHashChange = function() {
    var getPhotoRegExp = /#photo\/(\S+)/.exec(utilities.getHash());
    if (getPhotoRegExp) {
      if (this.galleryPictures.some(function(item) {
        return item.url === getPhotoRegExp[1];
      })) {
        this._showGallery(getPhotoRegExp[1]);
      } else {
        this._hideGallery();
      }
    } else {
      this._hideGallery();
    }
  };

  var gallery = new Gallery();

  module.exports = gallery;


/***/ }
/******/ ]);
