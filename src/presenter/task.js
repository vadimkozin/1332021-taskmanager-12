import TaskView from "../view/task.js";
import TaskEditView from "../view/task-edit.js";
import {render, replace, remove} from "../utils/render.js";
import {UserAction, UpdateType} from "../const.js";
import {isTaskRepeating, isDatesEqual} from "../utils/task.js";
import {ESCAPE_CODE} from "../const";

const Mode = {
  DEFAULT: `DEFAULT`,
  EDITING: `EDITING`
};

export default class Task {
  constructor(taskListContainer, changeData, changeMode) {
    this._taskListContainer = taskListContainer;
    this._changeData = changeData;
    this._changeMode = changeMode;

    this._taskComponent = null;
    this._taskEditComponent = null;
    this._mode = Mode.DEFAULT;

    this._setHandlers();
  }

  _setHandlers() {
    this._handlers = {};

    this._handlers.editClick = () => this._replaceCardToForm();

    this._handlers.favoriteClick = () => {
      this._changeData(
          UserAction.UPDATE_TASK,
          UpdateType.MINOR,
          Object.assign(
              {},
              this._task,
              {
                isFavorite: !this._task.isFavorite
              }
          )
      );
    };

    this._handlers.arhiveClick = () => {
      this._changeData(
          UserAction.UPDATE_TASK,
          UpdateType.MINOR,
          Object.assign(
              {},
              this._task,
              {
                isArchive: !this._task.isArchive
              }
          )
      );
    };

    this._handlers.formSubmit = (update) => {
      const isMinorUpdate =
        !isDatesEqual(this._task.dueDate, update.dueDate) ||
        isTaskRepeating(this._task.repeating) !== isTaskRepeating(update.repeating);

      this._changeData(
          UserAction.UPDATE_TASK,
          isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
          update
      );
      this._replaceFormToCard();
    };

    this._handlers.deleteClick = (task) => {
      this._changeData(
          UserAction.DELETE_TASK,
          UpdateType.MINOR,
          task
      );
    };

    this._handlers.escKeyDownHandler = (evt) => {
      if (evt.keyCode === ESCAPE_CODE) {
        evt.preventDefault();
        this._taskEditComponent.reset(this._task);
        this._replaceFormToCard();
      }
    };

    this._handlers.editClick = this._handlers.editClick.bind(this);
    this._handlers.favoriteClick = this._handlers.favoriteClick.bind(this);
    this._handlers.arhiveClick = this._handlers.arhiveClick.bind(this);
    this._handlers.formSubmit = this._handlers.formSubmit.bind(this);
    this._handlers.deleteClick = this._handlers.deleteClick.bind(this);
    this._handlers.escKeyDownHandler = this._handlers.escKeyDownHandler.bind(this);
  }

  init(task) {
    this._task = task;

    this._initSavePrev();

    this._taskComponent = new TaskView(task);
    this._taskEditComponent = new TaskEditView(task);

    this._initSetHandlers();

    if (this._initIsFirstCall()) {
      render(this._taskListContainer, this._taskComponent);
      return;
    }

    this._initReplaceComponent();
    this._initRemovePrev();
  }

  _initSavePrev() {
    this._prevTaskComponent = this._taskComponent;
    this._prevTaskEditComponent = this._taskEditComponent;
  }

  _initSetHandlers() {
    this._taskComponent.setEditClickHandler(this._handlers.editClick);
    this._taskComponent.setFavoriteClickHandler(this._handlers.favoriteClick);
    this._taskComponent.setArchiveClickHandler(this._handlers.arhiveClick);
    this._taskEditComponent.setFormSubmitHandler(this._handlers.formSubmit);
    this._taskEditComponent.setDeleteClickHandler(this._handlers.deleteClick);
  }

  _initIsFirstCall() {
    return (this._prevTaskComponent === null || this._prevTaskEditComponent === null);
  }

  _initReplaceComponent() {
    if (this._mode === Mode.DEFAULT) {
      replace(this._taskComponent, this._prevTaskComponent);
    }

    if (this._mode === Mode.EDITING) {
      replace(this._taskEditComponent, this._prevTaskEditComponent);
    }
  }

  _initRemovePrev() {
    remove(this._prevTaskComponent);
    remove(this._prevTaskEditComponent);
    this._prevTaskComponent = null;
    this._prevTaskEditComponent = null;
  }

  destroy() {
    remove(this._taskComponent);
    remove(this._taskEditComponent);
  }

  resetView() {
    if (this._mode !== Mode.DEFAULT) {
      this._replaceFormToCard();
    }
  }

  _replaceCardToForm() {
    replace(this._taskEditComponent, this._taskComponent);
    document.addEventListener(`keydown`, this._handlers.escKeyDownHandler);

    this._changeMode();
    this._mode = Mode.EDITING;
  }

  _replaceFormToCard() {
    replace(this._taskComponent, this._taskEditComponent);
    document.removeEventListener(`keydown`, this._handlers.escKeyDownHandler);

    this._mode = Mode.DEFAULT;
  }

}
