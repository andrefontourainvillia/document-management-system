class DocumentMetadataRepository {
  constructor() {
    this.documents = new Map();
  }

  create(metadata) {
    this.documents.set(metadata.id, { ...metadata });
    return { ...metadata };
  }

  findById(id) {
    const document = this.documents.get(id);
    return document ? { ...document } : undefined;
  }

  findByOwner(owner) {
    return [...this.documents.values()]
      .filter(document => document.owner === owner)
      .sort((left, right) => new Date(right.uploadedAt) - new Date(left.uploadedAt))
      .map(document => ({ ...document }));
  }
}

module.exports = { DocumentMetadataRepository };