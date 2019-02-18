# akincanasearch
A search engine for akincana.net

# Roadmap before v1.0

## Bharadwaj Samhita

#### Data Preprocessing
Data Preprocessing with Python.   

- [x] Use tesseract OCR on the original manuscript
- [ ] Add a transliteration scheme to each verse
- [ ] Associate a portion of the page image with each verse

#### REST API
Use PostgreSQL, Elasticsearch and a REST API built on Spring Boot to manage the data.

- [ ] Commit the data to PostgreSQL
- [ ] Build an account creation system with email verification
- [ ] Add API endpoints that allow data and user management for users with moderator permissions:
* suggest an edit ( anyone )
* suggest a tag ( anyone )
* approve edits and tag suggestions ( moderator )
* ban and/or mute users ( moderator )
- [ ] Set up a subscriber that will listen to changes on PostgreSQL and will replicate them on Elasticsearch   
- [ ] Configure Elasticsearch to allow API endpoints that will make literal, regexp and partial match queries to the data  

#### Front-end
Build an user interface for the REST API.
- [ ] Loading icon for queries
- [ ] "No results found" message

#### Testing   
- [ ] Write tests for the REST API
- [ ] Write tests for the front-end

#### Documentation   
- [ ] Document the REST API
- [ ] Document the front-end

#### Deployment
- [ ] Deploy with Docker

## Vedabase
Development of this project will be delayed until the Bharadwaj Samhita search engine reaches stable stage.   

#### Data Preprocessing
Data Preprocessing with Python.   

- [ ] Fetch the data and archive all links with scrapy  
- [ ] Slice lengthy outliers into smaller documents  
- [ ] Remove stopwords
- [ ] Detect common bigrams, trigrams and N-grams before tokenization ( i.e. "varnasrama dharma", "fools and rascals" )   
- [ ] Tokenize and lemmatize while keeping N-grams   
- [ ] Remove words that happen too often ( outliers )
- [ ] Run HDP
- [ ] Use FAISS to find the exact nearest neighbors for each topic vector   

#### REST API   
Use PostgreSQL, Elasticsearch and a REST API built on Spring Boot to manage the data.

- [ ] Commit the data to PostgreSQL
* Topic vectors
* Nearest neighbors for each topic vector
* Link and archived link to the document
- [ ] Add API endpoints that allow data and user management for users with moderator permissions:
* suggest a tag ( anyone )
* approve tags ( moderator )
* ban and/or mute users ( moderator )
- [ ] Set up a subscriber that will listen to changes on PostgreSQL and will replicate them on Elasticsearch   
- [ ] Configure Elasticsearch to allow API endpoints that will make literal, regexp and partial match queries to the data  

#### Front-end
Build an user interface for the REST API.

#### Testing   
- [ ] Write tests for the REST API
- [ ] Write tests for the front-end

#### Documentation   
- [ ] Document the REST API
- [ ] Document the front-end

#### Deployment
- [ ] Deploy with Docker
