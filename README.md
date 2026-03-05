# N/ Nécessaire — Gestionnaire de Tâches

> Application de gestion de tâches avec un backend Django REST Framework et un frontend HTML/CSS/JS minimaliste.

---

## Stack technique

- **Backend** : Python · Django · Django REST Framework
- **Base de données** : SQLite 
- **Frontend** : HTML / CSS / JavaScript vanilla (aucune dépendance)
- **API** : REST · JSON

---

## Prérequis

- Python **3.10+**
- pip
- Git

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/CONTRACTOR75/task_manager_back.git
cd task_manager_back
```

### 2. Créer et activer l'environnement virtuel

```bash
# Créer le venv
python -m venv venv

# Activer — Linux / macOS
source venv/bin/activate

# Activer — Windows
venv\Scripts\activate
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Appliquer les migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. (Optionnel) Créer un super-utilisateur pour l'admin Django

```bash
python manage.py createsuperuser
```

### 6. Lancer le serveur

```bash
python manage.py runserver
```

L'API est disponible sur `http://localhost:8000/api/`.

---

## Fichiers non inclus dans le dépôt

Les fichiers suivants sont exclus via `.gitignore` et doivent être recréés localement :

| Fichier / Dossier | Raison |
|---|---|
| `venv/` | Environnement virtuel local |
| `db.sqlite3` | Base de données locale |
| `__pycache__/` | Cache Python |
| `*.pyc` | Bytecode compilé |
| `.env` | Variables d'environnement sensibles |

---

## Structure du projet

```
task_manager_back/
├── config/
│   ├── settings.py       # Configuration Django
│   ├── urls.py           # URLs racine
│   └── wsgi.py
├── tasks/
│   ├── models.py         # Modèle Task
│   ├── serializers.py    # Serializers DRF
│   ├── views.py          # Vues API
│   └── urls.py           # URLs de l'app
├── frontend/
│   └── necessaire.html   # Interface utilisateur
│   └── script.js
│   └── styles.css
│   └── logo.png # Logo de l'application
├── manage.py
├── README.md
└── requirements.txt
```

---

## Endpoints API

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/api/tasks/` | Liste toutes les tâches |
| `POST` | `/api/tasks/` | Crée une nouvelle tâche |
| `GET` | `/api/tasks/<id>/` | Détail d'une tâche |
| `PATCH` | `/api/tasks/<id>/` | Modifie une tâche |
| `DELETE` | `/api/tasks/<id>/` | Supprime une tâche |
| `GET` | `/api/dashboard/stats/` | Statistiques par statut |

### Statuts disponibles

| Statut | Couleur | Signification |
|---|---|---|
| `pending` | ⚪ Gris | À faire |
| `in_progress` | 🟡 Jaune | En cours |
| `done` | 🟢 Vert | Terminée |
| `overdue` | 🔴 Rouge | Délai dépassé |

---

## Utiliser le frontend

Ouvre simplement le fichier `frontend/necessaire.html` dans un navigateur.

La Base URL est configurable directement dans la sidebar (défaut : `http://localhost:8000/api`). Le point coloré indique si l'API est joignable (🟢 connecté · 🔴 hors ligne).

> ⚠️ CORS doit être activé dans Django pour que le frontend puisse appeler l'API depuis le navigateur. Assure-toi que `django-cors-headers` est installé et configuré dans `settings.py`.

```python
# settings.py
CORS_ALLOW_ALL_ORIGINS = True  # Dev uniquement
```

---

## Variables d'environnement (optionnel)

Pour la production, crée un fichier `.env` à la racine :

```env
SECRET_KEY=ta_clé_secrète_django
DEBUG=False
ALLOWED_HOSTS=ton-domaine.com
DATABASE_URL=postgres://user:password@localhost:5432/necessaire
```

---

## Licence

Projet de groupe de classe — tous droits réservés.