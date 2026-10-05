function BlocAssociation({ bloc }) {
  return (
    <div className="bloc-association">
      <span className="icone">{bloc.icone}</span>
      <h3>{bloc.titre}</h3>
      <p className="texte-bloc">{bloc.texte}</p>
    </div>
  );
}

export default BlocAssociation;
