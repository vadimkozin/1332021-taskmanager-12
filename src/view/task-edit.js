import he from "he";
import SmartView from "./smart.js";
import {COLORS} from "../const.js";
import {isTaskRepeating, formatTaskDueDate} from "../utils/task.js";
import flatpickr from "flatpickr";

import "../../node_modules/flatpickr/dist/flatpickr.min.css";

const BLANK_TASK = {
  color: COLORS[0],
  description: ``,
  dueDate: null,
  repeating: {
    mo: false,
    tu: false,
    we: false,
    th: false,
    fr: false,
    sa: false,
    su: false
  },
  isArchive: false,
  isFavorite: false
};

const createTaskEditDateTemplate = (dueDate, isDueDate) => {
  return `<button class="card__date-deadline-toggle" type="button">
      date: <span class="card__date-status">${isDueDate ? `yes` : `no`}</span>
    </button>

    ${isDueDate ? `<fieldset class="card__date-deadline">
      <label class="card__input-deadline-wrap">
        <input
          class="card__date"
          type="text"
          placeholder=""
          name="date"
          value="${formatTaskDueDate(dueDate)}"
        />
      </label>
    </fieldset>` : ``}
  `;
};

const createTaskEditRepeatingTemplate = (repeating, isRepeating) => {
  return `<button class="card__repeat-toggle" type="button">
    repeat:<span class="card__repeat-status">${isRepeating ? `yes` : `no`}</span>
  </button>

  ${isRepeating ? `<fieldset class="card__repeat-days">
    <div class="card__repeat-days-inner">
      ${Object.entries(repeating).map(([day, repeat]) => `<input
        class="visually-hidden card__repeat-day-input"
        type="checkbox"
        id="repeat-${day}"
        name="repeat"
        value="${day}"
        ${repeat ? `checked` : ``}
      />
      <label class="card__repeat-day" for="repeat-${day}"
        >${day}</label
      >`).join(``)}
    </div>
  </fieldset>` : ``}`;
};

const createTaskEditColorsTemplate = (currentColor) => {
  return COLORS.map((color) => `<input
    type="radio"
    id="color-${color}"
    class="card__color-input card__color-input--${color} visually-hidden"
    name="color"
    value="${color}"
    ${currentColor === color ? `checked` : ``}
  />
  <label
    for="color-${color}"
    class="card__color card__color--${color}"
    >${color}</label
  >`).join(``);
};

const createTaskEditTemplate = (data) => {
  const {color, description, dueDate, repeating, isDueDate, isRepeating} = data;

  const dateTemplate = createTaskEditDateTemplate(dueDate, isDueDate);

  const repeatingClassName = isRepeating
    ? `card--repeat`
    : ``;
  const repeatingTemplate = createTaskEditRepeatingTemplate(repeating, isRepeating);

  const colorsTemplate = createTaskEditColorsTemplate(color);

  const isSubmitDisabled = (isDueDate && dueDate === null) || (isRepeating && !isTaskRepeating(repeating));

  return `<article class="card card--edit card--${color} ${repeatingClassName}">
    <form class="card__form" method="get">
      <div class="card__inner">
        <div class="card__color-bar">
          <svg class="card__color-bar-wave" width="100%" height="10">
            <use xlink:href="#wave"></use>
          </svg>
        </div>

        <div class="card__textarea-wrap">
          <label>
            <textarea
              class="card__text"
              placeholder="Start typing your text here..."
              name="text"
            >${he.encode(description)}</textarea>
          </label>
        </div>

        <div class="card__settings">
          <div class="card__details">
            <div class="card__dates">
              ${dateTemplate}

              ${repeatingTemplate}
            </div>
          </div>

          <div class="card__colors-inner">
            <h3 class="card__colors-title">Color</h3>
            <div class="card__colors-wrap">
              ${colorsTemplate}
            </div>
          </div>
        </div>

        <div class="card__status-btns">
          <button class="card__save" type="submit" ${isSubmitDisabled ? `disabled` : ``}>save</button>
          <button class="card__delete" type="button">delete</button>
        </div>
      </div>
    </form>
  </article>`;
};

export default class TaskEdit extends SmartView {
  constructor(task = BLANK_TASK) {
    super();
    this._data = TaskEdit.parseTaskToData(task);
    this._datepicker = null;

    this._setHandlers();
    this._setInnerHandlers();
    this._setDatepicker();
  }

  _setHandlers() {
    this._handlers = {};

    this._handlers.formSubmit = (evt) => {
      evt.preventDefault();
      this._callback.formSubmit(TaskEdit.parseDataToTask(this._data));
    };

    this._handlers.descriptionInput = (evt) => {
      evt.preventDefault();
      this.updateData({
        description: evt.target.value
      }, true);
    };

    this._handlers.dueDateToggle = (evt) => {
      evt.preventDefault();
      this.updateData({
        isDueDate: !this._data.isDueDate,
        isRepeating: !this._data.isDueDate && false
      });
    };

    this._handlers.dueDateChange = (selectedDates) => {
      this.updateData({
        dueDate: selectedDates[0]
      });
    };

    this._handlers.repeatingToggle = (evt) => {
      evt.preventDefault();
      this.updateData({
        isRepeating: !this._data.isRepeating,
        isDueDate: !this._data.isRepeating && false
      });
    };

    this._handlers.repeatingChange = (evt) => {
      evt.preventDefault();
      this.updateData({
        repeating: Object.assign(
            {},
            this._data.repeating,
            {[evt.target.value]: evt.target.checked}
        )
      });
    };

    this._handlers.colorChange = (evt) => {
      evt.preventDefault();
      this.updateData({
        color: evt.target.value
      });
    };

    this._handlers.formDeleteClick = (evt) => {
      evt.preventDefault();
      this._callback.deleteClick(TaskEdit.parseDataToTask(this._data));
    };

    this._handlers.formSubmit = this._handlers.formSubmit.bind(this);
    this._handlers.descriptionInput = this._handlers.descriptionInput.bind(this);
    this._handlers.dueDateToggle = this._handlers.dueDateToggle.bind(this);
    this._handlers.dueDateChange = this._handlers.dueDateChange.bind(this);
    this._handlers.repeatingToggle = this._handlers.repeatingToggle.bind(this);
    this._handlers.repeatingChange = this._handlers.repeatingChange.bind(this);
    this._handlers.colorChange = this._handlers.colorChange.bind(this);
    this._handlers.formDeleteClick = this._handlers.formDeleteClick.bind(this);
  }

  // Перегружаем метод родителя removeElement,
  // чтобы при удалении удалялся более ненужный календарь
  removeElement() {
    super.removeElement();

    if (this._datepicker) {
      this._datepicker.destroy();
      this._datepicker = null;
    }
  }

  reset(task) {
    this.updateData(
        TaskEdit.parseTaskToData(task)
    );
  }

  getTemplate() {
    return createTaskEditTemplate(this._data);
  }

  restoreHandlers() {
    this._setInnerHandlers();
    this._setDatepicker();
    this.setFormSubmitHandler(this._callback.formSubmit);
    this.setDeleteClickHandler(this._callback.deleteClick);
  }

  _setDatepicker() {
    if (this._datepicker) {
      // В случае обновления компонента удаляем вспомогательные DOM-элементы,
      // которые создает flatpickr при инициализации
      this._datepicker.destroy();
      this._datepicker = null;
    }

    this._initializeDatePicker();
  }

  _initializeDatePicker() {
    if (this._data.isDueDate) {
      // flatpickr есть смысл инициализировать только в случае,
      // если поле выбора даты доступно для заполнения
      this._datepicker = flatpickr(
          this.getElement().querySelector(`.card__date`),
          {
            dateFormat: `j F`,
            defaultDate: this._data.dueDate,
            onChange: this._handlers.dueDateChange // На событие flatpickr передаём наш колбэк
          }
      );
    }
  }

  _setInnerHandlers() {
    this.getElement()
      .querySelector(`.card__date-deadline-toggle`)
      .addEventListener(`click`, this._handlers.dueDateToggle);

    this.getElement()
      .querySelector(`.card__repeat-toggle`)
      .addEventListener(`click`, this._handlers.repeatingToggle);

    this.getElement()
      .querySelector(`.card__text`)
      .addEventListener(`input`, this._handlers.descriptionInput);

    if (this._data.isRepeating) {
      this.getElement()
        .querySelector(`.card__repeat-days-inner`)
        .addEventListener(`change`, this._handlers.repeatingChange);
    }

    this.getElement()
      .querySelector(`.card__colors-wrap`)
      .addEventListener(`change`, this._handlers.colorChange);
  }

  setFormSubmitHandler(callback) {
    this._callback.formSubmit = callback;
    this.getElement().querySelector(`form`).addEventListener(`submit`, this._handlers.formSubmit);
  }

  setDeleteClickHandler(callback) {
    this._callback.deleteClick = callback;
    this.getElement().querySelector(`.card__delete`).addEventListener(`click`, this._handlers.formDeleteClick);
  }

  static parseTaskToData(task) {
    return Object.assign(
        {},
        task,
        {
          isDueDate: task.dueDate !== null,
          isRepeating: isTaskRepeating(task.repeating)
        }
    );
  }

  static parseDataToTask(data) {
    data = Object.assign({}, data);

    if (!data.isDueDate) {
      data.dueDate = null;
    }

    if (!data.isRepeating) {
      data.repeating = {
        mo: false,
        tu: false,
        we: false,
        th: false,
        fr: false,
        sa: false,
        su: false
      };
    }

    delete data.isDueDate;
    delete data.isRepeating;

    return data;
  }
}
