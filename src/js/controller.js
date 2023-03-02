
import recipeView from './views/recipeView.js';
import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';


import paginationView from './views/paginationView.js';
import { async } from 'regenerator-runtime';

///////////////////////////////////////
if (module.hot) {

  module.hot.accept();
};

const controlRecipes = async function () {
  try {

    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //0.Actualizamos resultados de la vista con los marcados en la búsqueda
    resultsView.update(model.getSearchResultsPage());

    //3.Actualizando vista de marcadores
    bookmarksView.update(model.state.bookmarks);

    //1.Cargando la receta

    await model.loadRecipe(id);
    /* const { recipe } = model.state; */

    //2.Renderizando la receta.

    recipeView.render(model.state.recipe);

  } catch (err) {

    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {

  try {

    resultsView.renderSpinner();
    //1.Get search query
    const query = searchView.getQuery();
    if (!query) return;
    //2.Load search results
    await model.loadSearchResults(query);
    //3.Render results
    resultsView.render(model.getSearchResultsPage());
    //4.Render initial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);

  }
};

const controlPagination = function (goToPage) {
  //1.Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));
  //4.Render NEW pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {

  //Actualizar las porciones en el estado.
  model.updateServings(newServings);
  //Actualizar la vista
  /* recipeView.render(model.state.recipe); */
  recipeView.update(model.state.recipe);

}
const controlAddBookmark = function () {
  //1)Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  //2)Actualiza vista de receta
  recipeView.update(model.state.recipe);
  //3)Mostrar marcadores
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {

  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function (newRecipe) {
  console.log(newRecipe);
  try {

    //Mostrar spinner cargador
    addRecipeView.renderSpinner();
    //Cargamos los datos de la nueva receta
    await model.uploadRecipe(newRecipe);

    //Mostramos la receta añadida
    recipeView.render(model.state.recipe);

    //Mensaje de éxito
    addRecipeView.renderMessage();

    //Mostrar vista de marcadores
    bookmarksView.render(model.state.bookmarks);

    //Cambiar ID en URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Cerramos ventana de formulario
    setTimeout(function () {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000)
  } catch (err) {
    addRecipeView.renderError(err.message);
  }


};

const init = function () {

  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);

};

init();





