function _fl () {
  local cur

  COMPREPLY=()

  if [ $COMP_CWORD -eq 1 ]; then
    cur=${COMP_WORDS[COMP_CWORD]}
    COMPREPLY=( $( compgen -W '$(node $FRIENDLOG_INSTALL_DIR/index.js list-names)' -- $cur ) )
  fi

  return 0
}
