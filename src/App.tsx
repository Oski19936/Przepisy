import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  FormEvent,
} from "react";
import "./App.css";

interface Recipe {
  id?: number;
  title: string;
  ingredients: string[];
  description: string;
  tags: string[];
  created_at?: string;
}

const API_BASE = "https://przepisy.dkonto.pl/przepisy/api";

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filterText, setFilterText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const ingredientsRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/getRecipes.php`)
      .then((res) => {
        if (!res.ok) throw new Error("Błąd podczas pobierania");
        return res.json();
      })
      .then((data: Recipe[]) => {
        setRecipes(data);
      })
      .catch((err) => {
        console.error(err);
        alert("Nie udało się pobrać przepisów z serwera.");
      });
  }, []);

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    autoResize(ingredientsRef.current);
    autoResize(descriptionRef.current);
  }, [isEditing, editingIndex]);

  const resetForm = () => {
    if (titleRef.current) titleRef.current.value = "";
    if (ingredientsRef.current) {
      ingredientsRef.current.value = "";
      autoResize(ingredientsRef.current);
    }
    if (descriptionRef.current) {
      descriptionRef.current.value = "";
      autoResize(descriptionRef.current);
    }
    if (tagsRef.current) tagsRef.current.value = "";
    setIsEditing(false);
    setEditingIndex(null);
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const title = titleRef.current!.value.trim();
    const ingredientsRaw = ingredientsRef.current!.value.trim();
    const description = descriptionRef.current!.value.trim();
    const tagsRaw = tagsRef.current!.value.trim();
    if (!title || !ingredientsRaw || !description) {
      alert("Wypełnij wszystkie pola przed dodaniem przepisu.");
      return;
    }
    const ingredients = ingredientsRaw
      .split(",")
      .map((ing) => ing.trim())
      .filter((ing) => ing);
    const tags = tagsRaw
      .split(",")
      .map((tg) => tg.trim())
      .filter((tg) => tg.startsWith("#") && tg.length > 1);

    const payload = { title, ingredients, description, tags };
    try {
      const res = await fetch(`${API_BASE}/saveRecipe.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Błąd zapisu do bazy");
      const saved: Recipe = await res.json();
      setRecipes((prev) => [saved, ...prev]);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Nie udało się zapisać przepisu na serwerze.");
    }
  };

  const startEditing = (index: number) => {
    const r = recipes[index];
    if (titleRef.current) titleRef.current.value = r.title;
    if (ingredientsRef.current) {
      ingredientsRef.current.value = r.ingredients.join(", ");
      autoResize(ingredientsRef.current);
    }
    if (descriptionRef.current) {
      descriptionRef.current.value = r.description;
      autoResize(descriptionRef.current);
    }
    if (tagsRef.current) tagsRef.current.value = r.tags.join(", ");
    setIsEditing(true);
    setEditingIndex(index);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (editingIndex === null) return;
    const title = titleRef.current!.value.trim();
    const ingredientsRaw = ingredientsRef.current!.value.trim();
    const description = descriptionRef.current!.value.trim();
    const tagsRaw = tagsRef.current!.value.trim();
    if (!title || !ingredientsRaw || !description) {
      alert("Wypełnij wszystkie pola przed zapisaniem zmian.");
      return;
    }
    const ingredients = ingredientsRaw
      .split(",")
      .map((ing) => ing.trim())
      .filter((ing) => ing);
    const tags = tagsRaw
      .split(",")
      .map((tg) => tg.trim())
      .filter((tg) => tg.startsWith("#") && tg.length > 1);

    // (opcjonalnie) możesz wystawić updatePhp.php; na razie aktualizuj lokalnie:
    const updated: Recipe = {
      ...recipes[editingIndex],
      title,
      ingredients,
      description,
      tags,
    };
    const newList = [...recipes];
    newList[editingIndex] = updated;
    setRecipes(newList);
    resetForm();
  };

  const cancelEditing = () => {
    resetForm();
  };

  const handleDelete = (index: number) => {
    if (!window.confirm("Na pewno chcesz usunąć ten przepis?")) return;
    const newList = [...recipes];
    newList.splice(index, 1);
    setRecipes(newList);
    resetForm();
  };

  const filteredRecipes = recipes.filter((rec) => {
    if (!filterText.trim()) return true;
    const f = filterText.trim().toLowerCase();
    const inTitle = rec.title.toLowerCase().includes(f);
    const inIngredients = rec.ingredients.some((ing) =>
      ing.toLowerCase().includes(f)
    );
    const inTags = rec.tags.some((tg) => tg.toLowerCase().includes(f));
    return inTitle || inIngredients || inTags;
  });

  const onFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilterText(e.target.value);
  };

  const onTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    autoResize(e.currentTarget);
  };

  return (
    <div>
      <header>
        <h1>Moja Książka Przepisów</h1>
      </header>
      <main>
        <section className="recipe-form">
          <h2>Dodaj / Edytuj przepis</h2>
          <form onSubmit={isEditing ? handleUpdate : handleAdd}>
            <div className="form-row-top">
              <div className="form-group">
                <label htmlFor="title">Tytuł przepisu:</label>
                <input
                  type="text"
                  id="title"
                  placeholder="Np. Pierogi ruskie"
                  ref={titleRef}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ingredients">
                  Składniki (oddziel przecinkami):
                </label>
                <textarea
                  id="ingredients"
                  placeholder="Np. mąka, ziemniaki, ser, ..."
                  ref={ingredientsRef}
                  onInput={onTextareaInput}
                />
              </div>
            </div>
            <div className="form-row-bottom">
              <div className="form-group">
                <label htmlFor="description">Opis przygotowania:</label>
                <textarea
                  id="description"
                  placeholder="Np. Zagnieć ciasto, ugotuj ziemniaki, ..."
                  ref={descriptionRef}
                  onInput={onTextareaInput}
                />
              </div>
            </div>
            <div className="form-row-tags">
              <div className="form-group">
                <label htmlFor="tags">Tagi (oddziel przecinkami):</label>
                <input
                  type="text"
                  id="tags"
                  className="tags-input"
                  placeholder="Np. #Drób, #Olej"
                  ref={tagsRef}
                />
              </div>
            </div>
            <div className="form-actions">
              {!isEditing && (
                <button type="submit" id="add-btn">
                  Dodaj przepis
                </button>
              )}
              {isEditing && (
                <>
                  <button
                    type="submit"
                    id="update-btn"
                    style={{ backgroundColor: "var(--edit-color)" }}
                  >
                    Zapisz zmiany
                  </button>
                  <button
                    type="button"
                    id="cancel-edit-btn"
                    style={{ backgroundColor: "var(--delete-color)" }}
                    onClick={cancelEditing}
                  >
                    Anuluj edycję
                  </button>
                </>
              )}
            </div>
          </form>
        </section>
        <section>
          <h2>Lista przepisów</h2>
          <input
            type="text"
            id="search"
            placeholder="🔍 Szukaj przepisów..."
            value={filterText}
            onChange={onFilterChange}
          />
          <div id="recipes" className="recipes-grid">
            {filteredRecipes.map((rec, idx) => (
              <div className="recipe-item" key={idx}>
                <div className="recipe-item-header">
                  <h3>{rec.title}</h3>
                  <div className="buttons">
                    <button
                      className="edit-btn"
                      onClick={() => startEditing(idx)}
                    >
                      Edytuj
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(idx)}
                    >
                      Usuń
                    </button>
                  </div>
                </div>
                <div className="recipe-content">
                  <div className="recipe-ingredients">
                    <ul>
                      {rec.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="recipe-description">
                    <p>{rec.description}</p>
                  </div>
                </div>
                {rec.tags.length > 0 && (
                  <div className="recipe-tags">
                    {rec.tags.map((tg, i) => (
                      <span key={i}>{tg}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
