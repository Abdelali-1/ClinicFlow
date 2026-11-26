# ClinicFlow – Conception de la base de données

ClinicFlow contient 3 tables principales :

- **Users :** Stocke les comptes des administrateurs et du personnel.
- **Patients :** Stocke les informations des patients.
- **Appointments :** Stocke les rendez-vous des patients.

## Relations

- **1-N :** Un patient peut avoir plusieurs rendez-vous.
- **1-N :** Un utilisateur peut créer plusieurs rendez-vous.
- **1-1 :** Non nécessaire dans ce projet.
- **N-N :** Non nécessaire dans ce projet.

## Schéma de la base de données (ERD)

```mermaid
erDiagram
    USERS ||--o{ APPOINTMENTS : creates
    PATIENTS ||--o{ APPOINTMENTS : has
## Suppression

- Un patient ne peut pas être supprimé s'il possède des rendez-vous confirmés.
- Si le patient n'a aucun rendez-vous confirmé, il peut être supprimé ainsi que ses autres rendez-vous.
- Les informations du patient sont conservées tant qu'il existe un rendez-vous confirmé.

